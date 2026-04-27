import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp, WhatsAppKind } from "@/lib/whatsapp";
import { requireSuperAdmin } from "../../_helpers";

export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const { audience, kind, body } = await req.json();

  let recipients: { id?: string; phone: string }[] = [];
  if (audience === "TEAM") {
    const t = await prisma.teamMember.findMany({
      where: { deletedAt: null, status: "ACTIVE" },
    });
    recipients = t.map((x) => ({ phone: x.phone }));
  } else {
    const where = audience === "ALL"
      ? { deletedAt: null }
      : { deletedAt: null, status: "ACTIVE" };
    const m = await prisma.member.findMany({ where });
    recipients = m.map((x) => ({ id: x.id, phone: x.phone }));
  }

  let count = 0;
  for (const r of recipients) {
    await sendWhatsApp({
      phone: r.phone,
      memberId: r.id,
      kind: (kind as WhatsAppKind) || "BROADCAST",
      body,
    });
    count++;
  }
  return NextResponse.json({ count });
}
