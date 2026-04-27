// Pluggable WhatsApp provider. Currently simulates sends by logging and
// writing to MessageLog. Wire to Meta Cloud API / Twilio / Gupshup later.
import { prisma } from "./prisma";

export type WhatsAppKind = "DUE" | "RECEIPT" | "BROADCAST" | "HOLIDAY";

export async function sendWhatsApp(opts: {
  phone: string;
  body: string;
  kind: WhatsAppKind;
  memberId?: string;
}) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  let status: "SENT" | "FAILED" | "SIMULATED" = "SIMULATED";

  if (token && phoneId) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: opts.phone,
            type: "text",
            text: { body: opts.body },
          }),
        }
      );
      status = res.ok ? "SENT" : "FAILED";
    } catch {
      status = "FAILED";
    }
  } else {
    // Simulated: log to console for dev
    console.log(`[WA:${opts.kind}] -> ${opts.phone}: ${opts.body}`);
  }

  await prisma.messageLog.create({
    data: {
      phone: opts.phone,
      body: opts.body,
      kind: opts.kind,
      status,
      memberId: opts.memberId,
      sentAt: new Date(),
    },
  });

  return status;
}
