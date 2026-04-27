// Hit this endpoint on a schedule (cron/Vercel Cron) to auto-send
// WhatsApp reminders for dues and upcoming renewals.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";
import { fmtDate, inr } from "@/lib/utils";

export async function GET(_req: NextRequest) {
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 86400000);

  const subs = await prisma.subscription.findMany({
    where: { endDate: { lte: in7 } },
    include: { member: true },
  });

  let sent = 0;
  for (const s of subs) {
    const due = s.amount - s.amountPaid;
    if (s.endDate < now) {
      await sendWhatsApp({
        phone: s.member.phone,
        memberId: s.member.id,
        kind: "DUE",
        body: `Hi ${s.member.firstName}, your Xtreme Fitness membership expired on ${fmtDate(s.endDate)}. Renew to regain access.`,
      });
      sent++;
    } else if (due > 0) {
      await sendWhatsApp({
        phone: s.member.phone,
        memberId: s.member.id,
        kind: "DUE",
        body: `Hi ${s.member.firstName}, a balance of ${inr(due)} is pending on your Xtreme Fitness membership.`,
      });
      sent++;
    }
  }
  return NextResponse.json({ processed: subs.length, sent });
}
