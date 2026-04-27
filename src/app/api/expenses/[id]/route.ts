import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRoleFromSession, isSuperAdmin, requireSuperAdmin } from "../../_helpers";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;
  const role = getRoleFromSession(session);
  const permanent = req.nextUrl.searchParams.get("permanent") === "1";

  const existing = await prisma.expense.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (permanent) {
    if (!isSuperAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!existing.deletedAt) {
      return NextResponse.json(
        { error: "Only soft-deleted expenses can be permanently removed." },
        { status: 400 }
      );
    }
    await prisma.expense.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  }

  if (existing.deletedAt) {
    return NextResponse.json({ error: "Already deleted" }, { status: 400 });
  }

  await prisma.expense.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
