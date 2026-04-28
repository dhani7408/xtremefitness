import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fmtDate, inr } from "@/lib/utils";
import PageHeader from "@/components/admin/PageHeader";

export const dynamic = "force-dynamic";

function roundDue(amount: number, paid: number) {
  return Math.max(0, Math.round((amount - paid) * 100) / 100);
}

export default async function PendingPaymentsPage() {
  const subscriptions = await prisma.subscription.findMany({
    where: { member: { deletedAt: null } },
    include: { member: true, plan: true },
    orderBy: [{ memberId: "asc" }, { endDate: "asc" }],
  });

  const withDue = subscriptions.filter((s) => roundDue(s.amount, s.amountPaid) > 0.001);
  const memberIds = [...new Set(withDue.map((s) => s.memberId))];
  const totalDue = withDue.reduce((sum, s) => sum + roundDue(s.amount, s.amountPaid), 0);

  return (
    <div>
      <PageHeader
        title="Pending payments"
        subtitle={
          withDue.length === 0
            ? "No outstanding balances on active member records."
            : `${memberIds.length} member${memberIds.length === 1 ? "" : "s"} · ${withDue.length} plan${withDue.length === 1 ? "" : "s"} with balance · total due ${inr(totalDue)}`
        }
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-ink-700">
            <tr>
              <th className="p-3">Member</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Valid to</th>
              <th className="p-3 text-right">Paid / Total</th>
              <th className="p-3 text-right">Due</th>
              <th className="p-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {withDue.map((s) => {
              const due = roundDue(s.amount, s.amountPaid);
              const active = s.endDate >= new Date();
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">
                    {s.member.firstName} {s.member.lastName}
                  </td>
                  <td className="p-3">{s.member.phone}</td>
                  <td className="p-3">{s.plan.name}</td>
                  <td className="p-3">
                    {fmtDate(s.endDate)}
                    <div className="mt-0.5">
                      <span className={`badge text-[10px] ${active ? "badge-green" : "badge-red"}`}>
                        {active ? "Active" : "Ended"}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right text-ink-700">
                    {inr(s.amountPaid)} / {inr(s.amount)}
                  </td>
                  <td className="p-3 text-right font-semibold text-brand">{inr(due)}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/members/${s.memberId}`} className="text-brand hover:underline">
                      Record payment
                    </Link>
                  </td>
                </tr>
              );
            })}
            {withDue.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-ink-700">
                  Everyone is fully paid on recorded plans.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
