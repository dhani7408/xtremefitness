"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Team = {
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
};

export default function TeamEditDialog({ member, onClose }: { member: Team; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());
    const body: Record<string, unknown> = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      phone: raw.phone,
      email: raw.email || null,
      role: raw.role,
      salary: Number(raw.salary || 0),
      status: raw.status,
      fingerprintId: raw.fingerprintId || null,
      bio: raw.bio || null,
      photoUrl: raw.photoUrl || null,
    };
    const pwd = String(raw.portalPassword || "").trim();
    if (pwd) body.portalPassword = pwd;

    const res = await fetch(`/api/team/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      onClose();
      router.refresh();
    } else {
      setErr((await res.json()).error || "Failed");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit team member</h3>
          <button type="button" onClick={onClose} className="text-sm text-ink-700 hover:underline">
            Close
          </button>
        </div>
        <p className="mb-4 text-xs text-ink-700">Employee code: {member.employeeCode}</p>
        <form onSubmit={onSubmit} className="space-y-3">
          {err && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name</label>
              <input name="firstName" required className="input" defaultValue={member.firstName} />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input name="lastName" className="input" defaultValue={member.lastName} />
            </div>
          </div>
          <div>
            <label className="label">Phone</label>
            <input name="phone" required className="input" defaultValue={member.phone} />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" className="input" defaultValue={member.email ?? ""} />
          </div>
          <div>
            <label className="label">Role</label>
            <select name="role" className="input" defaultValue={member.role}>
              <option>OWNER</option>
              <option>TRAINER</option>
              <option>RECEPTION</option>
              <option>MANAGER</option>
              <option>CLEANING</option>
            </select>
          </div>
          <div>
            <label className="label">Salary (₹)</label>
            <input name="salary" type="number" className="input" defaultValue={member.salary} />
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" className="input" defaultValue={member.status}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <div>
            <label className="label">Fingerprint ID</label>
            <input name="fingerprintId" className="input" defaultValue={member.fingerprintId ?? ""} />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea name="bio" className="input min-h-[72px]" defaultValue={member.bio ?? ""} />
          </div>
          <div>
            <label className="label">Photo URL</label>
            <input name="photoUrl" className="input" defaultValue={member.photoUrl ?? ""} />
          </div>
          <div className="border-t border-black/5 pt-3">
            <label className="label">New portal password (optional)</label>
            <input name="portalPassword" type="password" className="input" placeholder="Only if this user has admin login" autoComplete="new-password" />
            <p className="mt-1 text-xs text-ink-700">Sets a new password for the linked manager account, if one exists.</p>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1">
              Cancel
            </button>
            <button disabled={loading} type="submit" className="btn btn-primary flex-1">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
