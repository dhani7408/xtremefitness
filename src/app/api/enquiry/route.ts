import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint to capture trial/contact form enquiries as inactive
// members (auto-generated member code). Admins can activate them later.
export async function POST(req: NextRequest) {
  const b = await req.json();
  if (!b.name || !b.phone) {
    return NextResponse.json({ error: "name and phone required" }, { status: 400 });
  }
  const [firstName, ...rest] = String(b.name).trim().split(/\s+/);
  const code = `XF-E${Math.floor(100000 + Math.random() * 900000)}`;
  try {
    await prisma.member.create({
      data: {
        memberCode: code,
        firstName,
        lastName: rest.join(" "),
        phone: String(b.phone),
        email: b.email || null,
        status: "INACTIVE",
        notes: b.message ? `Website enquiry: ${b.message}` : "Website enquiry",
      },
    });
  } catch (_e) {
    // if phone exists, quietly succeed
  }
  return NextResponse.json({ ok: true });
}
