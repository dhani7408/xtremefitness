import { prisma } from "@/lib/prisma";
import { inr, fmtDate, paymentInvoiceHref, paymentTypeLabel } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DeleteButton from "@/components/admin/DeleteButton";
import { getRoleFromSession, isManager, isSuperAdmin } from "@/lib/roles";
import InvoiceDownloadLink from "@/components/admin/InvoiceDownloadLink";

export const dynamic = "force-dynamic";

export default async function PersonalTrainingDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = getRoleFromSession(session);
  const manager = isManager(role);
  const superUser = isSuperAdmin(role);

  const ptRecord = await prisma.personalTraining.findUnique({
    where: { id: params.id },
    include: {
      member: true,
      trainer: true,
      payments: {
        where: { deletedAt: null },
        orderBy: { receivedAt: "desc" },
      },
    },
  });

  if (!ptRecord) return notFound();

  const now = new Date();
  const isExpired = ptRecord.endDate < now || ptRecord.sessions <= ptRecord.used || ptRecord.status === "EXPIRED";
  const due = Math.max(0, ptRecord.amount - ptRecord.amountPaid);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4">
        <div className="card p-5">
          <h2 className="mb-4 text-lg font-bold text-ink-900">Training Details</h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-ink-700 block text-xs uppercase tracking-wider">Member</span>
              <Link href={`/admin/members/${ptRecord.memberId}`} className="font-semibold text-brand hover:underline">
                {ptRecord.member.firstName} {ptRecord.member.lastName}
              </Link>
            </div>
            
            <div>
              <span className="text-ink-700 block text-xs uppercase tracking-wider">Trainer</span>
              <span className="font-medium text-ink-900">{ptRecord.trainer.firstName} {ptRecord.trainer.lastName}</span>
            </div>

            <div>
              <span className="text-ink-700 block text-xs uppercase tracking-wider">Duration</span>
              <span className="font-medium text-ink-900">{fmtDate(ptRecord.startDate)} to {fmtDate(ptRecord.endDate)}</span>
            </div>

            <div>
              <span className="text-ink-700 block text-xs uppercase tracking-wider">Sessions</span>
              <span className="font-medium text-ink-900">{ptRecord.used} used / {ptRecord.sessions} total</span>
              {ptRecord.sessions > 0 && (
                <div className="mt-1 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${ptRecord.used >= ptRecord.sessions ? 'bg-green-500' : 'bg-brand'}`} 
                    style={{ width: `${Math.min(100, (ptRecord.used / ptRecord.sessions) * 100)}%` }} 
                  />
                </div>
              )}
            </div>

            <div>
              <span className="text-ink-700 block text-xs uppercase tracking-wider">Status</span>
              <span className={`badge ${!isExpired && ptRecord.status === "ACTIVE" ? "badge-green" : ptRecord.status === "CANCELLED" ? "badge-gray" : "badge-red"}`}>
                {ptRecord.status === "CANCELLED" ? "Cancelled" : (!isExpired ? "Active" : "Completed/Expired")}
              </span>
            </div>

            {ptRecord.notes && (
              <div>
                <span className="text-ink-700 block text-xs uppercase tracking-wider">Notes</span>
                <p className="text-ink-900 italic">{ptRecord.notes}</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3 border-t border-black/5 pt-4">
            <Link href={`/admin/personal-training/${ptRecord.id}/edit`} className="btn btn-primary text-sm w-full sm:w-auto">
              Edit / Log Sessions
            </Link>
            {superUser && (
              <DeleteButton
                endpoint={`/api/personal-training/${ptRecord.id}`}
                label="Delete Record"
                confirm="Permanently delete this Personal Training record?"
                size="md"
                redirectTo="/admin/personal-training"
              />
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <section className="card p-5">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <h3 className="font-semibold">Financials & Payments</h3>
            {due > 0 && (
              <div className="text-sm">
                <span className="text-ink-700">Outstanding Due: </span>
                <span className="font-bold text-red-600">{inr(due)}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4 border-b border-black/5 pb-4">
            <div>
              <div className="text-xs text-ink-700 uppercase">Total PT Fee</div>
              <div className="font-semibold text-lg">{inr(ptRecord.amount)}</div>
            </div>
            <div>
              <div className="text-xs text-ink-700 uppercase">Amount Paid</div>
              <div className="font-semibold text-lg text-green-600">{inr(ptRecord.amountPaid)}</div>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-ink-700">
              <tr>
                <th className="py-2">Invoice</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Method</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ptRecord.payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 font-mono text-xs">{p.invoiceNo}</td>
                  <td>{fmtDate(p.receivedAt)}</td>
                  <td>{inr(p.amount)}</td>
                  <td>
                    <span
                      className={`badge text-[10px] ${p.payType === "FULL" ? "badge-green" : p.payType === "PARTIAL" ? "badge-yellow" : "badge-gray"}`}
                      title={paymentTypeLabel(p.payType).text}
                    >
                      {paymentTypeLabel(p.payType).short}
                    </span>
                  </td>
                  <td>{p.method}</td>
                  <td className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs sm:text-sm">
                      <Link
                        className="text-brand hover:underline"
                        href={paymentInvoiceHref(p.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open
                      </Link>
                      <InvoiceDownloadLink paymentId={p.id} invoiceNo={p.invoiceNo} />
                    </div>
                  </td>
                </tr>
              ))}
              {ptRecord.payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-3 text-ink-700">
                    No payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
