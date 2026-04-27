import { NextRequest, NextResponse } from "next/server";
import { ingestPunch } from "@/lib/essl";

// Manual punch from admin UI
export async function POST(req: NextRequest) {
  const b = await req.json();
  try {
    const att = await ingestPunch({
      fingerprintId: b.fingerprintId,
      timestamp: new Date(),
      deviceId: b.deviceId || "MANUAL",
    });
    return NextResponse.json(att);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
