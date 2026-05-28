"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditPTForm({ initial, trainers, superUser, memberName }: { initial: any, trainers: any[], superUser: boolean, memberName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  
  const [used, setUsed] = useState(initial.used);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());

    const res = await fetch(`/api/personal-training/${initial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);
    if (res.ok) {
      router.push(`/admin/personal-training/${initial.id}`);
      router.refresh();
    } else {
      setErr((await res.json()).error || "Failed to update");
    }
  }

  return (
    <div className="card p-5">
      <h2 className="mb-4 text-lg font-bold">Edit Personal Training ({memberName})</h2>
      {err && <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label">Trainer</label>
          <select name="trainerId" defaultValue={initial.trainerId} className="input" disabled={!superUser}>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
            ))}
          </select>
          {!superUser && <input type="hidden" name="trainerId" value={initial.trainerId} />}
          {!superUser && <p className="text-xs text-ink-700 mt-1">Only super admins can reassign trainers.</p>}
        </div>

        <div>
          <label className="label">Start Date</label>
          <input type="date" name="startDate" defaultValue={initial.startDate} className="input" />
        </div>
        <div>
          <label className="label">End Date</label>
          <input type="date" name="endDate" defaultValue={initial.endDate} className="input" />
        </div>

        <div>
          <label className="label">Total Sessions</label>
          <input type="number" name="sessions" defaultValue={initial.sessions} min="0" className="input" />
        </div>
        <div>
          <label className="label">Used Sessions</label>
          <div className="flex items-center gap-2">
            <input type="number" name="used" value={used} onChange={(e) => setUsed(Number(e.target.value))} min="0" className="input" />
            <button type="button" onClick={() => setUsed(used + 1)} className="btn btn-outline px-3 py-1">+</button>
            <button type="button" onClick={() => setUsed(Math.max(0, used - 1))} className="btn btn-outline px-3 py-1">-</button>
          </div>
        </div>

        <div>
          <label className="label">Total Amount (₹)</label>
          <input type="number" step="0.01" name="amount" defaultValue={initial.amount} className="input" disabled={!superUser} />
          {!superUser && <input type="hidden" name="amount" value={initial.amount} />}
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={initial.status} className="input">
            <option value="ACTIVE">ACTIVE</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label">Notes</label>
          <textarea name="notes" defaultValue={initial.notes || ""} className="input min-h-[100px]" placeholder="Add any progress notes here..." />
        </div>

        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
          <button type="button" onClick={() => router.back()} className="btn btn-outline">Cancel</button>
          <button disabled={loading} className="btn btn-primary">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
