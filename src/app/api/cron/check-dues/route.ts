// Hit this endpoint on a schedule (cron/Vercel Cron) to auto-send
// WhatsApp reminders for dues and upcoming renewals.
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";
import { fmtDate, inr } from "@/lib/utils";

// Cron route must run at request time, never during build/prerender.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 86400000);

  let subs: Awaited<ReturnType<typeof prisma.subscription.findMany>> = [];
  try {
    subs = await prisma.subscription.findMany({
      where: { endDate: { lte: in7 } },
      include: { member: true },
    });
  } catch (error) {
    // If DB/schema is not ready yet, do not fail build/deploy.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json({
        processed: 0,
        sent: 0,
        skipped: true,
        reason: "subscriptions table not found",
      });
    }
    throw error;
  }

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
