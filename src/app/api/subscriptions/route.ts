import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "../_helpers";

export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const b = await req.json();
  const plan = await prisma.plan.findUnique({ where: { id: b.planId } });
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 400 });

  const start = b.startDate ? new Date(b.startDate) : new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + plan.months);

  const sub = await prisma.subscription.create({
    data: {
      memberId: b.memberId,
      planId: plan.id,
      startDate: start,
      endDate: end,
      amount: plan.price,
      amountPaid: 0,
      status: "ACTIVE",
    },
  });
  return NextResponse.json(sub);
}
