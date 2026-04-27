import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "../_helpers";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const b = await req.json();
  const amount = Number(b.amount);
  if (!amount || !b.memberId) {
    return NextResponse.json({ error: "memberId and amount required" }, { status: 400 });
  }
  const member = await prisma.member.findUnique({ where: { id: b.memberId } });
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  // Apply payment to latest open subscription
  const openSub = await prisma.subscription.findFirst({
    where: { memberId: b.memberId },
    orderBy: { createdAt: "desc" },
  });

  const invoiceNo = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const payment = await prisma.payment.create({
    data: {
      memberId: b.memberId,
      subscriptionId: openSub?.id,
      amount,
      method: b.method || "CASH",
      note: b.note || null,
      invoiceNo,
    },
  });

  if (openSub) {
    await prisma.subscription.update({
      where: { id: openSub.id },
      data: { amountPaid: openSub.amountPaid + amount },
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
