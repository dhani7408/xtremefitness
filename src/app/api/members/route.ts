import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRoleFromSession, isSuperAdmin, requireAuth, nextCode } from "../_helpers";
import { sendWhatsApp } from "@/lib/whatsapp";
import { inr } from "@/lib/utils";

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

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

  type ReceiptPayload = {
    phone: string;
    memberId: string;
    firstName: string;
    amount: number;
    paymentId: string;
  };

  try {
    const { member, initialPayment, receiptNotify } = await prisma.$transaction(async (tx) => {
      let initialPayment: { id: string; invoiceNo: string; payType: string } | null = null;
      let receiptNotify: ReceiptPayload | null = null;

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

      const subscription = await tx.subscription.create({
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

      const rawPay = body.initialPaymentAmount;
      const payAmount =
        rawPay === undefined || rawPay === null || rawPay === ""
          ? NaN
          : roundMoney(Number(rawPay));

      if (Number.isFinite(payAmount) && payAmount > 0) {
        const due = roundMoney(subscription.amount - subscription.amountPaid);
        if (due <= 0) {
          throw new Error("NO_BALANCE");
        }
        if (payAmount > due + 0.009) {
          throw new Error(
            `PAYMENT_EXCEEDS:${inr(due)}`
          );
        }
        const invoiceNo = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const payType = payAmount >= due - 0.009 ? "FULL" : "PARTIAL";
        const method =
          typeof body.initialPaymentMethod === "string" && body.initialPaymentMethod.trim()
            ? body.initialPaymentMethod.trim()
            : "CASH";
        const payment = await tx.payment.create({
          data: {
            memberId: m.id,
            subscriptionId: subscription.id,
            amount: payAmount,
            method,
            payType,
            note:
              typeof body.initialPaymentNote === "string" && body.initialPaymentNote.trim()
                ? body.initialPaymentNote.trim()
                : null,
            invoiceNo,
          },
        });
        await tx.subscription.update({
          where: { id: subscription.id },
          data: { amountPaid: roundMoney(subscription.amountPaid + payAmount) },
        });
        initialPayment = { id: payment.id, invoiceNo: payment.invoiceNo, payType: payment.payType };
        receiptNotify = {
          phone: m.phone,
          memberId: m.id,
          firstName: m.firstName,
          amount: payAmount,
          paymentId: payment.id,
        };
      }

      return { member: m, initialPayment, receiptNotify };
    });

    if (receiptNotify) {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const invoiceUrl = `${baseUrl}/api/invoice/${receiptNotify.paymentId}`;
      await sendWhatsApp({
        phone: receiptNotify.phone,
        memberId: receiptNotify.memberId,
        kind: "RECEIPT",
        body: `Hi ${receiptNotify.firstName}, we received ₹${receiptNotify.amount} for your Xtreme Fitness membership. Download your invoice: ${invoiceUrl}`,
      });
    }

    return NextResponse.json({ ...member, initialPayment });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    if (msg === "INVALID_PLAN") {
      return NextResponse.json({ error: "Invalid or inactive package selected" }, { status: 400 });
    }
    if (msg === "NO_BALANCE") {
      return NextResponse.json({ error: "No balance due on the new subscription." }, { status: 400 });
    }
    if (msg.startsWith("PAYMENT_EXCEEDS:")) {
      const cap = msg.slice("PAYMENT_EXCEEDS:".length);
      return NextResponse.json(
        {
          error: `Amount exceeds balance due for this package (${cap}). Pay up to that amount, or leave initial payment blank and record it later.`,
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
