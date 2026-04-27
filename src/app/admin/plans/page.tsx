import Link from "next/link";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { inr, fmtDate } from "@/lib/utils";
import { authOptions } from "@/lib/auth";
import PageHeader from "@/components/admin/PageHeader";
import PlanForm from "./plan-form";
import DeleteButton from "@/components/admin/DeleteButton";
import { getRoleFromSession, isManager, isSuperAdmin } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function PlansPage({
  searchParams,
}: {
  searchParams: { trash?: string };
}) {
  const session = await getServerSession(authOptions);
  const role = getRoleFromSession(session);
  const superUser = isSuperAdmin(role);
  const manager = isManager(role);
  const trash = superUser && searchParams.trash === "1";

  const plans = await prisma.plan.findMany({
    where: trash ? { deletedAt: { not: null } } : { deletedAt: null },
    orderBy: { months: "asc" },
  });

  return (
    <div>
      <PageHeader
        title={trash ? "Deleted plans" : "Plans"}
        subtitle={trash ? `${plans.length} soft-deleted` : "Membership plans and pricing"}
      />
      {superUser && (
        <div className="mb-4 text-sm">
          {!trash ? (
            <Link href="/admin/plans?trash=1" className="text-brand hover:underline">
              View deleted
            </Link>
          ) : (
            <Link href="/admin/plans" className="text-brand hover:underline">
              Back to active plans
            </Link>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-ink-700">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Months</th>
                <th className="p-3">Price</th>
                <th className="p-3">Active</th>
                {trash && <th className="p-3">Deleted</th>}
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {plans.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{p.months}</td>
                  <td className="p-3">{inr(p.price)}</td>
                  <td className="p-3">
                    {p.active ? (
                      <span className="badge badge-green">Yes</span>
                    ) : (
                      <span className="badge badge-gray">No</span>
                    )}
                  </td>
                  {trash && (
                    <td className="p-3 text-xs text-ink-700">{p.deletedAt ? fmtDate(p.deletedAt) : "—"}</td>
                  )}
                  <td className="p-3 text-right">
                    {trash && superUser ? (
                      <DeleteButton
                        endpoint={`/api/plans/${p.id}`}
                        iconOnly
                        permanent
                        confirm={`Permanently delete plan "${p.name}"? This cannot be undone if the database allows it.`}
                        label="Purge"
                      />
                    ) : (
                      !trash && (
                        <DeleteButton
                          endpoint={`/api/plans/${p.id}`}
                          iconOnly
                          confirm={`Remove plan "${p.name}" from the active list?`}
                        />
                      )
                    )}
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={trash ? 6 : 5} className="p-6 text-center text-ink-700">
                    {trash ? "No deleted plans." : "No plans yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!manager && !trash && (
          <div className="card p-5">
            <h3 className="mb-3 font-semibold">Add Plan</h3>
            <PlanForm />
          </div>
        )}
      </div>
    </div>
  );
}
