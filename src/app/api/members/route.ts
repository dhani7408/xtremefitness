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
  if (!body.planId || typeof body.planId !== "string") {
    return NextResponse.json({ error: "Select a membership package" }, { status: 400 });
  }
  try {
    const member = await prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findFirst({
        where: { id: body.planId, deletedAt: null, active: true },
      });
      if (!plan) {
        throw new Error("INVALID_PLAN");
      }

      const m = await tx.member.create({
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

      const start = body.startDate ? new Date(body.startDate) : new Date();
      const end = new Date(start);
      end.setMonth(end.getMonth() + plan.months);

      await tx.subscription.create({
        data: {
          memberId: m.id,
          planId: plan.id,
          startDate: start,
          endDate: end,
          amount: plan.price,
          amountPaid: 0,
          status: "ACTIVE",
        },
      });

      return m;
    });
    return NextResponse.json(member);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    if (msg === "INVALID_PLAN") {
      return NextResponse.json({ error: "Invalid or inactive package selected" }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
