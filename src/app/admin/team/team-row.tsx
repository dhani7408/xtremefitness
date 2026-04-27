"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { inr } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";
import TeamEditDialog from "./team-edit-dialog";

export default function TeamRow({
  t,
  inTrash,
}: {
  t: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    role: string;
    salary: number;
    status: string;
    fingerprintId: string | null;
    bio: string | null;
    photoUrl: string | null;
    deletedAt: string | null;
  };
  inTrash?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  async function toggle() {
    setBusy(true);
    await fetch(`/api/team/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: t.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="p-3 font-mono text-xs">{t.employeeCode}</td>
        <td className="p-3 font-medium">
          {t.firstName} {t.lastName}
        </td>
        <td className="p-3 text-xs">{t.role}</td>
        <td className="p-3">{t.phone}</td>
        <td className="p-3">{inr(t.salary)}</td>
        <td className="p-3">
          <span className={`badge ${t.status === "ACTIVE" ? "badge-green" : "badge-gray"}`}>{t.status}</span>
        </td>
        <td className="p-3 text-xs">{t.fingerprintId || "-"}</td>
        <td className="p-3 text-right">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!inTrash && (
              <>
                <button type="button" onClick={() => setEditing(true)} className="text-brand hover:underline">
                  Edit
                </button>
                <button disabled={busy} onClick={toggle} className="text-brand hover:underline">
                  {t.status === "ACTIVE" ? "Deactivate" : "Activate"}
                </button>
                <DeleteButton
                  endpoint={`/api/team/${t.id}`}
                  iconOnly
                  confirm={`Remove team member ${t.firstName} ${t.lastName}? They will be hidden from the team list until restored or purged by a super admin.`}
                />
              </>
            )}
            {inTrash && (
              <DeleteButton
                endpoint={`/api/team/${t.id}`}
                iconOnly
                permanent
                confirm={`Permanently delete ${t.firstName} ${t.lastName} and remove all related data from the database? This cannot be undone.`}
                label="Purge"
              />
            )}
          </div>
        </td>
      </tr>
      {editing && <TeamEditDialog member={t} onClose={() => setEditing(false)} />}
    </>
  );
}
