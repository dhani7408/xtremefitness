import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRoleFromSession, isSuperAdmin, requireAuth } from "../../_helpers";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!isSuperAdmin(getRoleFromSession(session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  try {
    const m = await prisma.member.update({ where: { id: params.id }, data: body });
    return NextResponse.json(m);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const role = getRoleFromSession(session);
  const permanent = req.nextUrl.searchParams.get("permanent") === "1";

  const existing = await prisma.member.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (permanent) {
    if (!isSuperAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!existing.deletedAt) {
      return NextResponse.json(
        { error: "Only soft-deleted members can be permanently removed." },
        { status: 400 }
      );
    }
    await prisma.member.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  }

  if (existing.deletedAt) {
    return NextResponse.json({ error: "Already deleted" }, { status: 400 });
  }

  if (!isSuperAdmin(role) && role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.member.update({
    where: { id: params.id },
    data: { deletedAt: new Date(), status: "INACTIVE" },
  });
  return NextResponse.json({ ok: true });
}
