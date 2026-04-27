"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TeamForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [portal, setPortal] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(fd);
    payload.grantPortalAccess = portal;
    if (!portal) {
      delete payload.portalEmail;
      delete payload.portalPassword;
    }
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      (e.target as HTMLFormElement).reset();
      setPortal(false);
      router.refresh();
    } else {
      setErr((await res.json()).error || "Failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {err && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">First Name</label>
          <input name="firstName" required className="input" />
        </div>
        <div>
          <label className="label">Last Name</label>
          <input name="lastName" className="input" />
        </div>
      </div>
      <div>
        <label className="label">Phone</label>
        <input name="phone" required className="input" />
      </div>
      <div>
        <label className="label">Role (on floor)</label>
        <select name="role" className="input" defaultValue="TRAINER">
          <option>OWNER</option>
          <option>TRAINER</option>
          <option>RECEPTION</option>
          <option>MANAGER</option>
          <option>CLEANING</option>
        </select>
      </div>
      <div>
        <label className="label">Salary (₹)</label>
        <input name="salary" type="number" defaultValue={0} className="input" />
      </div>
      <div>
        <label className="label">Fingerprint ID</label>
        <input name="fingerprintId" className="input" />
      </div>

      <div className="rounded-lg border border-black/10 bg-gray-50 p-3">
        <label className="flex cursor-pointer items-start gap-2 text-sm">
          <input type="checkbox" checked={portal} onChange={(e) => setPortal(e.target.checked)} className="mt-1" />
          <span>
            <span className="font-semibold">Manager admin access</span>
            <span className="mt-0.5 block text-xs text-ink-700">
              Lets this person sign in to the admin panel with limited access (members and plans only). Soft-deletes
              only; super admin can purge records.
            </span>
          </span>
        </label>
        {portal && (
          <div className="mt-3 space-y-2 border-t border-black/5 pt-3">
            <div>
              <label className="label">Login email</label>
              <input name="portalEmail" type="email" className="input" required={portal} autoComplete="off" />
            </div>
            <div>
              <label className="label">Login password</label>
              <input name="portalPassword" type="password" className="input" required={portal} autoComplete="new-password" />
            </div>
          </div>
        )}
      </div>

      <button disabled={loading} className="btn btn-primary w-full">
        {loading ? "Saving..." : "Add Member"}
      </button>
    </form>
  );
}
