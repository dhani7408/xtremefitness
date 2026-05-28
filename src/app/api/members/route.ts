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

      let ptRecord: { id: string; amount: number } | null = null;
      if (body.ptTrainerId) {
        const ptMonths = Number(body.ptMonths || 1);
        const ptEnd = new Date(start);
        ptEnd.setMonth(ptEnd.getMonth() + ptMonths);
        
        ptRecord = await tx.personalTraining.create({
          data: {
            memberId: m.id,
            trainerId: body.ptTrainerId,
            startDate: start,
            endDate: ptEnd,
            sessions: Number(body.ptSessions || 0),
            amount: Number(body.ptAmount || 0),
            notes: body.ptNotes || null,
          }
        });
      }

      const rawPay = body.initialPaymentAmount;
      const payAmount =
        rawPay === undefined || rawPay === null || rawPay === ""
          ? NaN
          : roundMoney(Number(rawPay));

      if (Number.isFinite(payAmount) && payAmount > 0) {
        const subDue = roundMoney(subscription.amount);
        const ptDue = ptRecord ? roundMoney(ptRecord.amount) : 0;
        const totalDue = roundMoney(subDue + ptDue);
        
        if (totalDue <= 0) {
          throw new Error("NO_BALANCE");
        }
        if (payAmount > totalDue + 0.009) {
          throw new Error(`PAYMENT_EXCEEDS:${inr(totalDue)}`);
        }
        
        const invoiceNo = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const method =
          typeof body.initialPaymentMethod === "string" && body.initialPaymentMethod.trim()
            ? body.initialPaymentMethod.trim()
            : "CASH";
        
        let amtForSub = Math.min(payAmount, subDue);
        let amtForPt = payAmount - amtForSub;
        
        if (amtForSub > 0) {
          const payment = await tx.payment.create({
            data: {
              memberId: m.id,
              subscriptionId: subscription.id,
              amount: amtForSub,
              method,
              payType: amtForSub >= subDue - 0.009 ? "FULL" : "PARTIAL",
              note:
                typeof body.initialPaymentNote === "string" && body.initialPaymentNote.trim()
                  ? body.initialPaymentNote.trim()
                  : "Membership Payment",
              invoiceNo: invoiceNo + (amtForPt > 0 ? "-S" : ""),
            },
          });
          await tx.subscription.update({
            where: { id: subscription.id },
            data: { amountPaid: roundMoney(subscription.amountPaid + amtForSub) },
          });
          initialPayment = { id: payment.id, invoiceNo: payment.invoiceNo, payType: payment.payType };
        }
        
        if (amtForPt > 0 && ptRecord) {
          const payment = await tx.payment.create({
            data: {
              memberId: m.id,
              personalTrainingId: ptRecord.id,
              amount: amtForPt,
              method,
              payType: amtForPt >= ptDue - 0.009 ? "FULL" : "PARTIAL",
              note: "PT Payment",
              invoiceNo: amtForSub > 0 ? invoiceNo + "-P" : invoiceNo,
            },
          });
          await tx.personalTraining.update({
            where: { id: ptRecord.id },
            data: { amountPaid: amtForPt },
          });
          if (!initialPayment) {
             initialPayment = { id: payment.id, invoiceNo: payment.invoiceNo, payType: payment.payType };
          }
        }
        
        receiptNotify = {
          phone: m.phone,
          memberId: m.id,
          firstName: m.firstName,
          amount: payAmount,
          paymentId: initialPayment?.id || "",
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
