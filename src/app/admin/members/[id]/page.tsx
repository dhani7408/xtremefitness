import { prisma } from "@/lib/prisma";
import { inr, fmtDate, paymentInvoiceHref, paymentTypeLabel } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MemberActions from "./actions";
import DeleteButton from "@/components/admin/DeleteButton";
import { getRoleFromSession, isManager, isSuperAdmin } from "@/lib/roles";
import InvoiceDownloadLink from "@/components/admin/InvoiceDownloadLink";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = getRoleFromSession(session);
  const manager = isManager(role);
  const superUser = isSuperAdmin(role);

  const member = await prisma.member.findUnique({
    where: { id: params.id },
    include: {
      subscriptions: {
        include: { plan: true, payments: { where: { deletedAt: null } } },
        orderBy: { createdAt: "desc" },
      },
      payments: {
        where: { deletedAt: null },
        orderBy: { receivedAt: "desc" },
        include: { subscription: { include: { plan: true } } },
      },
      attendance: { orderBy: { checkIn: "desc" }, take: 15 },
      messages: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!member) return notFound();
  if (member.deletedAt && !superUser) return notFound();

  const plans = await prisma.plan.findMany({
    where: { active: true, deletedAt: null },
    orderBy: { months: "asc" },
  });

  const now = new Date();
  const activeSubs = member.subscriptions
    .filter((s) => s.endDate >= now)
    .slice()
    .sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  const pending = member.subscriptions.reduce((acc, s) => acc + Math.max(0, s.amount - s.amountPaid), 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-2xl font-bold text-brand">
              {member.firstName[0]}
            </div>
            <div>
              <div className="text-xl font-bold">
                {member.firstName} {member.lastName}
              </div>
              <div className="text-sm text-ink-700">{member.phone}</div>
              <div className="mt-1 font-mono text-xs text-ink-700">{member.memberCode}</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`badge ${member.status === "ACTIVE" ? "badge-green" : "badge-gray"}`}>
              {member.status}
            </span>
            {member.deletedAt && (
              <span className="badge badge-gray">Deleted {fmtDate(member.deletedAt)}</span>
            )}
            {activeSubs.length > 0 ? (
              <span className="badge badge-green">
                {activeSubs.length === 1 ? "1 active plan" : `${activeSubs.length} active plans`}
              </span>
            ) : (
              <span className="badge badge-red">No active subscription</span>
            )}
            {member.fingerprintId ? (
              <span className="badge badge-blue">FP: {member.fingerprintId}</span>
            ) : (
              <span className="badge badge-yellow">Fingerprint not enrolled</span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 border-t border-black/5 pt-3">
            {!member.deletedAt && (
              <Link href={`/admin/members/${member.id}/edit`} className="btn btn-outline text-sm">
                Edit details
              </Link>
            )}
            {!member.deletedAt && (
              <DeleteButton
                endpoint={`/api/members/${member.id}`}
                label="Remove member (soft delete)"
                confirm={`Remove member ${member.firstName} ${member.lastName} from the active list? Super admin can purge later.`}
                size="md"
                redirectTo="/admin/members"
              />
            )}
            {member.deletedAt && superUser && (
              <DeleteButton
                endpoint={`/api/members/${member.id}`}
                label="Permanently delete"
                permanent
                confirm={`Permanently remove ${member.firstName} ${member.lastName} from the database? This cannot be undone.`}
                size="md"
                redirectTo="/admin/members"
              />
            )}
          </div>
        </div>
        {!member.deletedAt && (superUser || manager) && (
          <MemberActions
            member={JSON.parse(JSON.stringify(member))}
            plans={superUser ? JSON.parse(JSON.stringify(plans)) : []}
            isSuperUser={superUser}
          />
        )}
      </div>

      <div className="lg:col-span-2 space-y-6">
        <section className="card p-5">
          <h3 className="mb-3 font-semibold">Subscriptions</h3>
          <p className="mb-3 text-xs text-ink-700">
            <strong>Due</strong> = plan amount minus paid. Record payments in the sidebar; each payment gets a printable invoice.
          </p>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-ink-700">
              <tr>
                <th className="py-2">Plan</th>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {member.subscriptions.map((s) => {
                const due = Math.max(0, s.amount - s.amountPaid);
                return (
                <tr key={s.id}>
                  <td className="py-2">{s.plan.name}</td>
                  <td>{fmtDate(s.startDate)}</td>
                  <td>{fmtDate(s.endDate)}</td>
                  <td>{inr(s.amount)}</td>
                  <td>{inr(s.amountPaid)}</td>
                  <td className={due > 0.01 ? "font-semibold text-brand" : "text-ink-700"}>{inr(due)}</td>
                  <td>
                    <span className={`badge ${s.endDate >= now ? "badge-green" : "badge-red"}`}>
                      {s.endDate >= now ? "Active" : "Expired"}
                    </span>
                  </td>
                </tr>
                );
              })}
              {member.subscriptions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-3 text-ink-700">
                    No subscriptions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
        <section className="card p-5">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <h3 className="font-semibold">Payments & invoices</h3>
            {pending > 0 && (
              <div className="text-sm">
                <span className="text-ink-700">Outstanding: </span>
                <span className="font-bold text-brand">{inr(pending)}</span>
              </div>
            )}
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-ink-700">
              <tr>
                <th className="py-2">Invoice</th>
                <th>Plan</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Method</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {member.payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 font-mono text-xs">{p.invoiceNo}</td>
                  <td className="max-w-[140px] truncate text-ink-800" title={p.subscription?.plan.name}>
                    {p.subscription?.plan.name ?? "—"}
                  </td>
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
                      {!manager && (
                        <DeleteButton
                          endpoint={`/api/payments/${p.id}`}
                          iconOnly
                          confirm={`Delete payment of ₹${p.amount}? This will reverse it from the subscription balance.`}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {member.payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-3 text-ink-700">
                    No payments yet. Use <strong>Record payment</strong> in the sidebar to collect fees; an invoice is generated for each entry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="card p-5">
          <h3 className="mb-3 font-semibold">Recent Attendance</h3>
          <ul className="divide-y text-sm">
            {member.attendance.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2">
                <span>
                  {fmtDate(a.checkIn)} · {new Date(a.checkIn).toLocaleTimeString("en-IN")}
                </span>
                <span className={`badge ${a.allowed ? "badge-green" : "badge-red"}`}>
                  {a.allowed ? "Allowed" : a.denyReason || "Denied"}
                </span>
              </li>
            ))}
            {member.attendance.length === 0 && <li className="py-2 text-ink-700">No check-ins yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
