import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getRoleFromSession, isSuperAdmin, requireSuperAdmin } from "../../_helpers";

const PATCHABLE = new Set([
  "firstName",
  "lastName",
  "phone",
  "email",
  "role",
  "salary",
  "status",
  "fingerprintId",
  "bio",
  "photoUrl",
]);

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const body = await req.json();
  const data = Object.fromEntries(
    Object.entries(body).filter(([k]) => PATCHABLE.has(k))
  ) as Record<string, unknown>;

  const portalPassword =
    typeof body.portalPassword === "string" && body.portalPassword.length > 0
      ? body.portalPassword
      : null;

  try {
    const t = await prisma.teamMember.update({ where: { id: params.id }, data });

    if (portalPassword) {
      const admin = await prisma.adminUser.findUnique({ where: { teamMemberId: params.id } });
      if (admin) {
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { passwordHash: await bcrypt.hash(portalPassword, 10) },
        });
      }
    }

    return NextResponse.json(t);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;
  const role = getRoleFromSession(session);
  const permanent = req.nextUrl.searchParams.get("permanent") === "1";

  const existing = await prisma.teamMember.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (permanent) {
    if (!isSuperAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!existing.deletedAt) {
      return NextResponse.json(
        { error: "Only soft-deleted team members can be permanently removed." },
        { status: 400 }
      );
    }
    await prisma.adminUser.deleteMany({ where: { teamMemberId: params.id } });
    await prisma.teamMember.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  }

  if (existing.deletedAt) {
    return NextResponse.json({ error: "Already deleted" }, { status: 400 });
  }

  await prisma.teamMember.update({
    where: { id: params.id },
    data: { deletedAt: new Date(), status: "INACTIVE" },
  });
  return NextResponse.json({ ok: true });
}
