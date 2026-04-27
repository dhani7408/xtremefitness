// ESSL attendance handler. Devices such as eSSL K30/X990 support the
// "iclock push" protocol and send ATTLOG lines to /iclock/cdata.
// We expose a simple ingestion helper that can be used by the push
// endpoint or by a local bridge service.
import { prisma } from "./prisma";

export type EsslPunch = {
  fingerprintId: string; // enroll id on device
  timestamp: Date;
  deviceId?: string;
};

export async function ingestPunch(punch: EsslPunch) {
  // Look up member first, then team
  const member = await prisma.member.findUnique({
    where: { fingerprintId: punch.fingerprintId },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        orderBy: { endDate: "desc" },
        take: 1,
      },
    },
  });

  if (member) {
    const active = member.subscriptions[0];
    const allowed =
      member.status === "ACTIVE" && !!active && active.endDate >= new Date();

    const denyReason = !allowed
      ? member.status !== "ACTIVE"
        ? "Member inactive"
        : !active
        ? "No active subscription"
        : "Subscription expired"
      : null;

    return prisma.attendance.create({
      data: {
        memberId: member.id,
        personType: "MEMBER",
        checkIn: punch.timestamp,
        deviceId: punch.deviceId,
        allowed,
        denyReason: denyReason ?? undefined,
      },
    });
  }

  const team = await prisma.teamMember.findUnique({
    where: { fingerprintId: punch.fingerprintId },
  });
  if (team) {
    return prisma.attendance.create({
      data: {
        teamMemberId: team.id,
        personType: "TEAM",
        checkIn: punch.timestamp,
        deviceId: punch.deviceId,
        allowed: team.status === "ACTIVE",
        denyReason: team.status !== "ACTIVE" ? "Team member inactive" : undefined,
      },
    });
  }

  throw new Error(`Unknown fingerprint id: ${punch.fingerprintId}`);
}

// Parse a raw ESSL ATTLOG line: "PIN<TAB>TIME<TAB>STATUS<TAB>VERIFY..."
export function parseAttlog(line: string): EsslPunch | null {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 2) return null;
  const [pin, date, time] = parts;
  const ts = new Date(`${date}T${time || "00:00:00"}`);
  if (isNaN(ts.getTime())) return null;
  return { fingerprintId: pin, timestamp: ts };
}
