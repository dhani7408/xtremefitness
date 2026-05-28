import { prisma } from "@/lib/prisma";
import { inr, fmtDate, paymentInvoiceHref, paymentTypeLabel } from "@/lib/utils";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import ExpenseForm from "./expense-form";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function FinancePage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  
  const filter = searchParams.filter || "month";
  let dateFilter: any = undefined;
  let filterLabel = "All time";
  
  if (filter === "today") {
    dateFilter = { gte: startOfDay };
    filterLabel = "Today";
  } else if (filter === "month") {
    dateFilter = { gte: startOfMonth };
    filterLabel = "This month";
  } else if (filter === "year") {
    dateFilter = { gte: startOfYear };
    filterLabel = "This year";
  }

  const [payments, expenses, income, outgo] = await Promise.all([
    prisma.payment.findMany({ 
      where: { deletedAt: null, ...(dateFilter ? { receivedAt: dateFilter } : {}) }, 
      include: { member: true }, 
      orderBy: { receivedAt: "desc" }, 
      take: dateFilter ? undefined : 50 
    }),
    prisma.expense.findMany({ 
      where: { deletedAt: null, ...(dateFilter ? { spentAt: dateFilter } : {}) }, 
      orderBy: { spentAt: "desc" }, 
      take: dateFilter ? undefined : 50 
    }),
    prisma.payment.aggregate({ 
      _sum: { amount: true }, 
      where: { deletedAt: null, ...(dateFilter ? { receivedAt: dateFilter } : {}) } 
    }),
    prisma.expense.aggregate({ 
      _sum: { amount: true }, 
      where: { deletedAt: null, ...(dateFilter ? { spentAt: dateFilter } : {}) } 
    }),
  ]);
  const profit = (income._sum.amount || 0) - (outgo._sum.amount || 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader title="Finance" subtitle="Payments & expenses" />
        <div className="flex gap-2">
          <Link href="/admin/finance?filter=today" className={`btn btn-outline text-xs py-1 px-3 ${filter === "today" ? "bg-brand text-white border-brand" : ""}`}>Today</Link>
          <Link href="/admin/finance?filter=month" className={`btn btn-outline text-xs py-1 px-3 ${filter === "month" ? "bg-brand text-white border-brand" : ""}`}>Month</Link>
          <Link href="/admin/finance?filter=year" className={`btn btn-outline text-xs py-1 px-3 ${filter === "year" ? "bg-brand text-white border-brand" : ""}`}>Year</Link>
          <Link href="/admin/finance?filter=all" className={`btn btn-outline text-xs py-1 px-3 ${filter === "all" ? "bg-brand text-white border-brand" : ""}`}>All time</Link>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs uppercase text-ink-700">Income ({filterLabel})</div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600">{inr(income._sum.amount || 0)}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs uppercase text-ink-700">Expenses ({filterLabel})</div>
          <div className="mt-1 text-2xl font-extrabold text-red-600">{inr(outgo._sum.amount || 0)}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs uppercase text-ink-700">Net Profit ({filterLabel})</div>
          <div className={`mt-1 text-2xl font-extrabold ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {inr(profit)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 card overflow-x-auto">
          <div className="flex items-center justify-between p-4">
            <h3 className="font-semibold">
              {filterLabel} Payments
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-ink-700">
              <tr>
                <th className="p-3">Invoice</th>
                <th className="p-3">Member</th>
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Method</th>
                <th className="p-3">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{p.invoiceNo}</td>
                  <td className="p-3">
                    <Link href={`/admin/members/${p.memberId}`} className="text-brand hover:underline">
                      {p.member.firstName} {p.member.lastName}
                    </Link>
                  </td>
                  <td className="p-3">{fmtDate(p.receivedAt)}</td>
                  <td className="p-3">
                    <span
                      className={`badge text-[10px] ${p.payType === "FULL" ? "badge-green" : p.payType === "PARTIAL" ? "badge-yellow" : "badge-gray"}`}
                      title={paymentTypeLabel(p.payType).text}
                    >
                      {paymentTypeLabel(p.payType).short}
                    </span>
                  </td>
                  <td className="p-3">{p.method}</td>
                  <td className="p-3 font-semibold">{inr(p.amount)}</td>
                  <td className="p-3 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
                      <Link href={paymentInvoiceHref(p.id)} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                        Open
                      </Link>
                      <Link href={paymentInvoiceHref(p.id, "download")} className="text-brand hover:underline">
                        Download
                      </Link>
                      <DeleteButton endpoint={`/api/payments/${p.id}`} iconOnly confirm={`Delete payment of ₹${p.amount}?`} />
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan={7} className="p-5 text-center text-ink-700">No payments recorded.</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 font-semibold">Add Expense</h3>
            <ExpenseForm />
          </div>
          <div className="card overflow-x-auto">
            <div className="p-4 font-semibold">Recent Expenses</div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-ink-700">
                <tr><th className="p-3">Title</th><th className="p-3">Category</th><th className="p-3">Date</th><th className="p-3">Amount</th><th></th></tr>
              </thead>
              <tbody className="divide-y">
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="p-3">{e.title}</td>
                    <td className="p-3 text-xs">{e.category}</td>
                    <td className="p-3">{fmtDate(e.spentAt)}</td>
                    <td className="p-3">{inr(e.amount)}</td>
                    <td className="p-3 text-right">
                      <DeleteButton endpoint={`/api/expenses/${e.id}`} iconOnly confirm={`Delete expense "${e.title}"?`} />
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan={5} className="p-5 text-center text-ink-700">No expenses.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
