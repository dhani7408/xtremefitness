import { prisma } from "@/lib/prisma";
import { fmtDateTime } from "@/lib/utils";
import PageHeader from "@/components/admin/PageHeader";
import ManualPunch from "./manual-punch";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const [records, todayCount, deniedCount] = await Promise.all([
    prisma.attendance.findMany({
      orderBy: { checkIn: "desc" },
      take: 200,
      include: { member: true, teamMember: true },
    }),
    prisma.attendance.count({
      where: { checkIn: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.attendance.count({
      where: {
        allowed: false,
        checkIn: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Check-ins from ESSL fingerprint devices"
      />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="card p-5">
          <div className="text-xs uppercase text-ink-700">Today Check-ins</div>
          <div className="mt-1 text-2xl font-extrabold">{todayCount}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs uppercase text-ink-700">Denied Today</div>
          <div className="mt-1 text-2xl font-extrabold text-red-600">{deniedCount}</div>
        </div>
        <div className="lg:col-span-2 card p-5">
          <div className="mb-2 text-xs uppercase text-ink-700">Manual Punch (Test)</div>
          <ManualPunch />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-ink-700">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Person</th>
              <th className="p-3">Type</th>
              <th className="p-3">Source</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {records.map((a) => {
              const person = a.member
                ? `${a.member.firstName} ${a.member.lastName}`
                : a.teamMember
                ? `${a.teamMember.firstName} ${a.teamMember.lastName}`
                : "Unknown";
              return (
                <tr key={a.id}>
                  <td className="p-3">{fmtDateTime(a.checkIn)}</td>
                  <td className="p-3 font-medium">{person}</td>
                  <td className="p-3 text-xs">{a.personType}</td>
                  <td className="p-3 text-xs">{a.source}{a.deviceId ? ` · ${a.deviceId}` : ""}</td>
                  <td className="p-3">
                    <span className={`badge ${a.allowed ? "badge-green" : "badge-red"}`}>
                      {a.allowed ? "Allowed" : a.denyReason || "Denied"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {records.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-ink-700">No check-ins yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
