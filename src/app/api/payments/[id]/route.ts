import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRoleFromSession, isSuperAdmin, requireSuperAdmin } from "../../_helpers";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;
  const role = getRoleFromSession(session);
  const permanent = req.nextUrl.searchParams.get("permanent") === "1";

  const payment = await prisma.payment.findUnique({ where: { id: params.id } });
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (permanent) {
    if (!isSuperAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!payment.deletedAt) {
      return NextResponse.json(
        { error: "Only soft-deleted payments can be permanently removed." },
        { status: 400 }
      );
    }
    await prisma.payment.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  }

  if (payment.deletedAt) {
    return NextResponse.json({ error: "Already deleted" }, { status: 400 });
  }

  await prisma.payment.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  });
  if (payment.subscriptionId) {
    const sub = await prisma.subscription.findUnique({ where: { id: payment.subscriptionId } });
    if (sub) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { amountPaid: Math.max(0, sub.amountPaid - payment.amount) },
      });
    }
  }
  return NextResponse.json({ ok: true });
}
