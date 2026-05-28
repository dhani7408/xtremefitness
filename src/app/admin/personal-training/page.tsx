import Link from "next/link";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { fmtDate, inr } from "@/lib/utils";
import { authOptions } from "@/lib/auth";
import PageHeader from "@/components/admin/PageHeader";
import { getRoleFromSession, isManager, isSuperAdmin } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function PersonalTrainingPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await getServerSession(authOptions);
  const role = getRoleFromSession(session);
  const superUser = isSuperAdmin(role);
  const manager = isManager(role);

  const status = searchParams.status;
  const now = new Date();

  const ptRecords = await prisma.personalTraining.findMany({
    where: {
      status: status ? status : undefined,
    },
    include: {
      member: true,
      trainer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Personal Training"
        subtitle={`${ptRecords.length} records`}
      />
      <form className="card mb-4 flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={status ?? ""} className="input w-32">
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <button className="btn btn-outline">Filter</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-ink-700">
            <tr>
              <th className="p-3">Member</th>
              <th className="p-3">Trainer</th>
              <th className="p-3">Dates</th>
              <th className="p-3">Sessions</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Due</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ptRecords.map((pt) => {
              const due = Math.max(0, pt.amount - pt.amountPaid);
              const isExpired = pt.endDate < now || pt.sessions <= pt.used || pt.status === "EXPIRED";
              return (
                <tr key={pt.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">
                    <Link href={`/admin/members/${pt.memberId}`} className="text-brand hover:underline">
                      {pt.member.firstName} {pt.member.lastName}
                    </Link>
                    <div className="text-xs text-ink-700 font-mono mt-1">{pt.member.memberCode}</div>
                  </td>
                  <td className="p-3">
                    {pt.trainer.firstName} {pt.trainer.lastName}
                  </td>
                  <td className="p-3 text-xs">
                    {fmtDate(pt.startDate)} - {fmtDate(pt.endDate)}
                  </td>
                  <td className="p-3">
                    {pt.used} / {pt.sessions}
                  </td>
                  <td className="p-3">
                    {inr(pt.amount)}
                  </td>
                  <td className={`p-3 ${due > 0 ? "font-semibold text-brand" : "text-ink-700"}`}>
                    {inr(due)}
                  </td>
                  <td className="p-3">
                    <span className={`badge ${!isExpired && pt.status === "ACTIVE" ? "badge-green" : pt.status === "CANCELLED" ? "badge-gray" : "badge-red"}`}>
                      {pt.status === "CANCELLED" ? "Cancelled" : (!isExpired ? "Active" : "Completed")}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/personal-training/${pt.id}`} className="text-brand hover:underline font-medium">
                        Details
                      </Link>
                      <Link href={`/admin/members/${pt.memberId}`} className="text-brand hover:underline text-xs">
                        Member Profile
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {ptRecords.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-ink-700">
                  No personal training records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
