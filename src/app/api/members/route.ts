import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRoleFromSession, isSuperAdmin, requireAuth, nextCode } from "../_helpers";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const members = await prisma.member.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!isSuperAdmin(getRoleFromSession(session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  try {
    const member = await prisma.member.create({
      data: {
        memberCode: body.memberCode || nextCode("XF-M"),
        firstName: body.firstName,
        lastName: body.lastName || "",
        phone: body.phone,
        email: body.email || null,
        gender: body.gender || null,
        dob: body.dob ? new Date(body.dob) : null,
        address: body.address || null,
        emergencyNo: body.emergencyNo || null,
        status: body.status || "ACTIVE",
        fingerprintId: body.fingerprintId || null,
      },
    });
    return NextResponse.json(member);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
