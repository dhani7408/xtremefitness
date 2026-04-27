import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";
import { requireSuperAdmin } from "../../_helpers";
import { fmtDate, inr } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const { memberId } = await req.json();
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { subscriptions: { orderBy: { endDate: "desc" }, take: 1 } },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const sub = member.subscriptions[0];
  const due = sub ? sub.amount - sub.amountPaid : 0;
  const body =
    sub && sub.endDate < new Date()
      ? `Hi ${member.firstName}, your Xtreme Fitness membership expired on ${fmtDate(sub.endDate)}. Please renew to continue accessing the gym.`
      : due > 0
      ? `Hi ${member.firstName}, a balance of ${inr(due)} is pending on your Xtreme Fitness membership. Kindly clear it at your earliest convenience.`
      : `Hi ${member.firstName}, a friendly reminder from Xtreme Fitness. Please contact us for your membership details.`;
  const status = await sendWhatsApp({ phone: member.phone, memberId: member.id, kind: "DUE", body });
  return NextResponse.json({ status });
}
