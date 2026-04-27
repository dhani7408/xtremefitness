import { prisma } from "@/lib/prisma";
import { inr, fmtDate } from "@/lib/utils";
import {
  Users,
  IndianRupee,
  TrendingUp,
  CircleOff,
  Fingerprint,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalMembers,
    activeMembers,
    activeSubs,
    expiredSubs,
    todayCollection,
    monthCollection,
    yearCollection,
    todayCheckins,
    dueList,
    recentAtt,
  ] = await Promise.all([
    prisma.member.count({ where: { deletedAt: null } }),
    prisma.member.count({ where: { deletedAt: null, status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "ACTIVE", endDate: { gte: now } } }),
    prisma.subscription.count({ where: { OR: [{ status: "EXPIRED" }, { endDate: { lt: now } }] } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { deletedAt: null, receivedAt: { gte: startOfDay } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { deletedAt: null, receivedAt: { gte: startOfMonth } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { deletedAt: null, receivedAt: { gte: startOfYear } } }),
    prisma.attendance.count({ where: { checkIn: { gte: startOfDay } } }),
    prisma.subscription.findMany({
      where: {
        endDate: { lt: new Date(now.getTime() + 7 * 86400000) },
        member: { deletedAt: null },
      },
      include: { member: true },
      orderBy: { endDate: "asc" },
      take: 8,
    }),
    prisma.attendance.findMany({
      orderBy: { checkIn: "desc" },
      take: 10,
      include: { member: true, teamMember: true },
    }),
  ]);

  const stats = [
    { label: "Today's Collection", value: inr(todayCollection._sum.amount || 0), icon: IndianRupee, color: "bg-pink-500" },
    { label: "Month Collection", value: inr(monthCollection._sum.amount || 0), icon: TrendingUp, color: "bg-indigo-500" },
    { label: "Year Collection", value: inr(yearCollection._sum.amount || 0), icon: IndianRupee, color: "bg-purple-500" },
    { label: "Active Members", value: String(activeMembers), icon: Users, color: "bg-amber-500" },
    { label: "Active Subscriptions", value: String(activeSubs), icon: TrendingUp, color: "bg-emerald-500" },
    { label: "Expired Subs", value: String(expiredSubs), icon: CircleOff, color: "bg-red-500" },
    { label: "Today Check-ins", value: String(todayCheckins), icon: Fingerprint, color: "bg-sky-500" },
    { label: "Total Members", value: String(totalMembers), icon: Users, color: "bg-gray-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${s.color} text-white`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="text-xl font-extrabold">{s.value}</div>
            <div className="text-xs uppercase tracking-wide text-ink-700">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Renewals / Dues
            </h3>
            <Link href="/admin/finance" className="text-sm text-brand">View all</Link>
          </div>
          <div className="divide-y">
            {dueList.map((s) => {
              const pending = s.amount - s.amountPaid;
              const expired = s.endDate < now;
              return (
                <div key={s.id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">{s.member.firstName} {s.member.lastName}</div>
                    <div className="text-xs text-ink-700">
                      {s.member.phone} · ends {fmtDate(s.endDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    {expired && <span className="badge badge-red">Expired</span>}
                    {pending > 0 && <div className="text-xs text-red-600">Due: {inr(pending)}</div>}
                  </div>
                </div>
              );
            })}
            {dueList.length === 0 && <div className="py-4 text-sm text-ink-700">No pending renewals 🎉</div>}
          </div>
        </section>

        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <Fingerprint className="h-4 w-4 text-sky-500" /> Recent Attendance
            </h3>
            <Link href="/admin/attendance" className="text-sm text-brand">View all</Link>
          </div>
          <div className="divide-y">
            {recentAtt.map((a) => {
              const person = a.member
                ? `${a.member.firstName} ${a.member.lastName}`
                : a.teamMember
                ? `${a.teamMember.firstName} ${a.teamMember.lastName}`
                : "Unknown";
              return (
                <div key={a.id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">{person}</div>
                    <div className="text-xs text-ink-700">
                      {a.personType} · {fmtDate(a.checkIn)} {new Date(a.checkIn).toLocaleTimeString("en-IN")}
                    </div>
                  </div>
                  <span className={`badge ${a.allowed ? "badge-green" : "badge-red"}`}>
                    {a.allowed ? "Allowed" : "Denied"}
                  </span>
                </div>
              );
            })}
            {recentAtt.length === 0 && <div className="py-4 text-sm text-ink-700">No attendance yet.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
