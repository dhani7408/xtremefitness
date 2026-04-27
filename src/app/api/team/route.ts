import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, nextCode } from "../_helpers";

export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  return NextResponse.json(await prisma.teamMember.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const body = await req.json();
  const grantPortal = Boolean(body.grantPortalAccess);
  const portalEmail = typeof body.portalEmail === "string" ? body.portalEmail.trim().toLowerCase() : "";
  const portalPassword = typeof body.portalPassword === "string" ? body.portalPassword : "";

  if (grantPortal) {
    if (!portalEmail || !portalPassword) {
      return NextResponse.json(
        { error: "Manager portal access requires email and password." },
        { status: 400 }
      );
    }
  }

  try {
    const t = await prisma.teamMember.create({
      data: {
        employeeCode: body.employeeCode || nextCode("XF-T"),
        firstName: body.firstName,
        lastName: body.lastName || "",
        phone: body.phone,
        email: body.email || null,
        role: body.role || "TRAINER",
        salary: Number(body.salary || 0),
        status: body.status || "ACTIVE",
        fingerprintId: body.fingerprintId || null,
      },
    });

    if (grantPortal) {
      try {
        const passwordHash = await bcrypt.hash(portalPassword, 10);
        await prisma.adminUser.create({
          data: {
            email: portalEmail,
            name: `${body.firstName} ${body.lastName || ""}`.trim(),
            passwordHash,
            role: "MANAGER",
            teamMemberId: t.id,
          },
        });
      } catch (portalErr) {
        await prisma.teamMember.delete({ where: { id: t.id } });
        throw portalErr;
      }
    }

    return NextResponse.json(t);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
