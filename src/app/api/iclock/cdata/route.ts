// ESSL push-protocol endpoint. ESSL devices (via the iclock push protocol)
// send ATTLOG lines as text body. We parse and ingest them.
import { NextRequest, NextResponse } from "next/server";
import { ingestPunch, parseAttlog } from "@/lib/essl";

export async function GET(req: NextRequest) {
  // Handshake responses for ESSL devices
  const sn = req.nextUrl.searchParams.get("SN") || "unknown";
  return new NextResponse(
    `GET OPTION FROM: ${sn}\nATTLOGStamp=9999\nOpStamp=9999\nErrorDelay=60\nDelay=10\nTransTimes=00:00;14:05\nTransInterval=1\nTransFlag=TransData AttLog OpLog\nRealtime=1\nEncrypt=0\n`,
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get("SN") || undefined;
  const table = req.nextUrl.searchParams.get("table");
  const text = await req.text();

  if (table !== "ATTLOG") {
    return new NextResponse("OK", { status: 200 });
  }

  const lines = text.split(/\r?\n/).filter(Boolean);
  let ok = 0;
  let fail = 0;
  for (const line of lines) {
    const punch = parseAttlog(line);
    if (!punch) {
      fail++;
      continue;
    }
    try {
      await ingestPunch({ ...punch, deviceId });
      ok++;
    } catch {
      fail++;
    }
  }
  return new NextResponse(`OK: ${ok} FAIL: ${fail}`, { status: 200 });
}
