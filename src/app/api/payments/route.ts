import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRoleFromSession, requireAuth } from "../_helpers";
import { isManager, isSuperAdmin } from "@/lib/roles";
import { sendWhatsApp } from "@/lib/whatsapp";
import { inr } from "@/lib/utils";

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const role = getRoleFromSession(session);
  if (!isSuperAdmin(role) && !isManager(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const b = await req.json();
  const amount = roundMoney(Number(b.amount));
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Enter a valid payment amount" }, { status: 400 });
  }
  if (!b.memberId) {
    return NextResponse.json({ error: "memberId required" }, { status: 400 });
  }

  const member = await prisma.member.findUnique({ where: { id: b.memberId } });
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  let sub: any = null;
  let pt: any = null;
  let due = 0;
  let targetName = "";

  if (typeof b.target === "string" && b.target) {
    const [type, id] = b.target.split(":");
    if (type === "SUB") {
      sub = await prisma.subscription.findFirst({
        where: { id, memberId: b.memberId },
        include: { plan: true },
      });
    } else if (type === "PT") {
      pt = await prisma.personalTraining.findFirst({
        where: { id, memberId: b.memberId },
        include: { trainer: true },
      });
    }
  } else if (typeof b.subscriptionId === "string" && b.subscriptionId) {
    sub = await prisma.subscription.findFirst({
      where: { id: b.subscriptionId, memberId: b.memberId },
      include: { plan: true },
    });
  }

  // Fallback to auto-select if nothing passed (legacy support)
  if (!sub && !pt) {
    const candidates = await prisma.subscription.findMany({
      where: { memberId: b.memberId },
      orderBy: { endDate: "asc" },
      include: { plan: true },
    });
    sub = candidates.find((s) => roundMoney(s.amount - s.amountPaid) > 0) ?? null;
  }

  if (sub) {
    due = roundMoney(sub.amount - sub.amountPaid);
    targetName = sub.plan.name;
  } else if (pt) {
    due = roundMoney(pt.amount - pt.amountPaid);
    targetName = `Personal Training`;
  } else {
    return NextResponse.json(
      { error: "No package found, or none has a balance due." },
      { status: 400 }
    );
  }

  if (due <= 0) {
    return NextResponse.json({ error: "This package is already fully paid." }, { status: 400 });
  }
  if (amount > due + 0.009) {
    return NextResponse.json(
      { error: `Amount exceeds balance due for ${targetName} (${inr(due)}). Pay up to that amount.` },
      { status: 400 }
    );
  }

  const invoiceNo = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const payType = amount >= due - 0.009 ? "FULL" : "PARTIAL";

  const payment = await prisma.payment.create({
    data: {
      memberId: b.memberId,
      subscriptionId: sub ? sub.id : null,
      personalTrainingId: pt ? pt.id : null,
      amount,
      method: typeof b.method === "string" ? b.method : "CASH",
      payType,
      note: typeof b.note === "string" && b.note.trim() ? b.note.trim() : null,
      invoiceNo,
    },
  });

  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { amountPaid: roundMoney(sub.amountPaid + amount) },
    });
  } else if (pt) {
    await prisma.personalTraining.update({
      where: { id: pt.id },
      data: { amountPaid: roundMoney(pt.amountPaid + amount) },
    });
  }

  // Trigger receipt WhatsApp message
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const invoiceUrl = `${baseUrl}/api/invoice/${payment.id}`;
  await sendWhatsApp({
    phone: member.phone,
    memberId: member.id,
    kind: "RECEIPT",
    body: `Hi ${member.firstName}, we received ₹${amount} for your Xtreme Fitness membership. Download your invoice: ${invoiceUrl}`,
  });

  return NextResponse.json(payment);
}
