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
export const fetchCache = "force-no-store";

type SubWithMember = Prisma.SubscriptionGetPayload<{
  include: { member: true };
}>;

export async function GET(_req: NextRequest) {
  // Optional protection for Vercel Cron: when CRON_SECRET is set,
  // only requests with matching Authorization header are allowed.
  // Build-time prerender requests won't have this header, so they exit early.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = _req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { processed: 0, sent: 0, skipped: true, reason: "unauthorized cron request" },
        { status: 401 }
      );
    }
  }

  // During `next build`, some setups may still evaluate route handlers.
  // Never touch DB in build phase; run only at runtime (cron hit).
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return NextResponse.json({
      processed: 0,
      sent: 0,
      skipped: true,
      reason: "build phase",
    });
  }
  if (process.env.VERCEL === "1" && !process.env.VERCEL_REGION) {
    return NextResponse.json({
      processed: 0,
      sent: 0,
      skipped: true,
      reason: "vercel build phase",
    });
  }

  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 86400000);

  let subs: SubWithMember[] = [];
  try {
    subs = await prisma.subscription.findMany({
      where: { endDate: { lte: in7 } },
      include: { member: true },
    });
  } catch (error: unknown) {
    // If DB/schema is not ready yet, do not fail build/deploy.
    const msg = error instanceof Error ? error.message : String(error);
    const knownTableMissing =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021";
    const textTableMissing =
      /table .* does not exist/i.test(msg) || /relation .* does not exist/i.test(msg);
    const dbUnavailable =
      /can't reach database server/i.test(msg) || /connect|connection|timeout/i.test(msg);

    if (knownTableMissing || textTableMissing || dbUnavailable) {
      return NextResponse.json({
        processed: 0,
        sent: 0,
        skipped: true,
        reason: "database not ready for cron route",
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
