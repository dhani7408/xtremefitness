import Link from "next/link";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import PageHeader from "@/components/admin/PageHeader";
import TeamForm from "./team-form";
import TeamRow from "./team-row";
import { getRoleFromSession, isSuperAdmin } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: { trash?: string };
}) {
  const session = await getServerSession(authOptions);
  const superUser = isSuperAdmin(getRoleFromSession(session));
  const trash = superUser && searchParams.trash === "1";

  const team = await prisma.teamMember.findMany({
    where: trash ? { deletedAt: { not: null } } : { deletedAt: null },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <PageHeader
        title={trash ? "Deleted team" : "Team"}
        subtitle={trash ? `${team.length} soft-deleted` : `${team.length} active members`}
      />
      {superUser && (
        <div className="mb-4 flex gap-3 text-sm">
          {!trash ? (
            <Link href="/admin/team?trash=1" className="text-brand hover:underline">
              View deleted
            </Link>
          ) : (
            <Link href="/admin/team" className="text-brand hover:underline">
              Back to active team
            </Link>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-ink-700">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Salary</th>
                <th className="p-3">Status</th>
                <th className="p-3">FP</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {team.map((t) => (
                <TeamRow key={t.id} t={JSON.parse(JSON.stringify(t))} inTrash={trash} />
              ))}
              {team.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-ink-700">
                    {trash ? "No deleted team members." : "No team members yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!trash && (
          <div className="card p-5">
            <h3 className="mb-3 font-semibold">Add Team Member</h3>
            <TeamForm />
          </div>
        )}
      </div>
    </div>
  );
}
