import Link from "next/link";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/utils";
import { authOptions } from "@/lib/auth";
import PageHeader from "@/components/admin/PageHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import { getRoleFromSession, isManager, isSuperAdmin } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; trash?: string };
}) {
  const session = await getServerSession(authOptions);
  const role = getRoleFromSession(session);
  const superUser = isSuperAdmin(role);
  const manager = isManager(role);
  const trash = superUser && searchParams.trash === "1";

  const q = searchParams.q?.trim();
  const status = searchParams.status;

  const members = await prisma.member.findMany({
    where: {
      deletedAt: trash ? { not: null } : null,
      AND: [
        q
          ? {
              OR: [
                { firstName: { contains: q } },
                { lastName: { contains: q } },
                { phone: { contains: q } },
                { memberCode: { contains: q } },
                { email: { contains: q } },
              ],
            }
          : {},
        status ? { status } : {},
      ],
    },
    include: {
      subscriptions: { orderBy: { endDate: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return (
    <div>
      <PageHeader
        title={trash ? "Deleted members" : "Members"}
        subtitle={trash ? `${members.length} soft-deleted` : `${members.length} total`}
        action={
          !manager && !trash
            ? { href: "/admin/members/new", label: "+ Add Member" }
            : undefined
        }
      />
      {superUser && (
        <div className="mb-4 text-sm">
          {!trash ? (
            <Link href="/admin/members?trash=1" className="text-brand hover:underline">
              View deleted
            </Link>
          ) : (
            <Link href="/admin/members" className="text-brand hover:underline">
              Back to active members
            </Link>
          )}
        </div>
      )}
      <form className="card mb-4 flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="label">Search</label>
          <input name="q" defaultValue={q ?? ""} className="input w-64" placeholder="Name / phone / code" />
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={status ?? ""} className="input w-40">
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        {!trash && <input type="hidden" name="trash" value="" />}
        {trash && <input type="hidden" name="trash" value="1" />}
        <button className="btn btn-outline">Filter</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-ink-700">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Status</th>
              {trash && <th className="p-3">Deleted</th>}
              {!trash && <th className="p-3">Subscription</th>}
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map((m) => {
              const sub = m.subscriptions[0];
              const subActive = sub && sub.endDate >= now;
              return (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{m.memberCode}</td>
                  <td className="p-3 font-medium">
                    {m.firstName} {m.lastName}
                  </td>
                  <td className="p-3">{m.phone}</td>
                  <td className="p-3">
                    <span className={`badge ${m.status === "ACTIVE" ? "badge-green" : "badge-gray"}`}>
                      {m.status}
                    </span>
                  </td>
                  {trash && (
                    <td className="p-3 text-xs text-ink-700">
                      {m.deletedAt ? fmtDate(m.deletedAt) : "—"}
                    </td>
                  )}
                  {!trash && (
                    <td className="p-3 text-xs">
                      {sub ? (
                        <>
                          <span className={`badge ${subActive ? "badge-green" : "badge-red"}`}>
                            {subActive ? "Active" : "Expired"}
                          </span>
                          <div className="mt-1 text-ink-700">Ends {fmtDate(sub.endDate)}</div>
                        </>
                      ) : (
                        <span className="badge badge-yellow">No plan</span>
                      )}
                    </td>
                  )}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/members/${m.id}`} className="text-brand hover:underline">
                        View
                      </Link>
                      {trash && superUser ? (
                        <DeleteButton
                          endpoint={`/api/members/${m.id}`}
                          iconOnly
                          permanent
                          confirm={`Permanently remove ${m.firstName} ${m.lastName} from the database? This cannot be undone.`}
                          label="Purge"
                        />
                      ) : (
                        !trash && (
                          <DeleteButton
                            endpoint={`/api/members/${m.id}`}
                            iconOnly
                            confirm={`Remove member ${m.firstName} ${m.lastName} from the active list? Super admin can purge later.`}
                          />
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {members.length === 0 && (
              <tr>
                <td colSpan={trash ? 6 : 6} className="p-6 text-center text-ink-700">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
