"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { inr } from "@/lib/utils";

export default function MemberActions({
  member,
  plans,
  pending,
}: {
  member: any;
  plans: any[];
  pending: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function toggleStatus() {
    setBusy("status");
    await fetch(`/api/members/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }),
    });
    setBusy(null);
    router.refresh();
  }

  async function sendDue() {
    setBusy("due");
    await fetch(`/api/messages/due`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: member.id }),
    });
    setBusy(null);
    router.refresh();
  }

  async function assignPlan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy("plan");
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/subscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: member.id, ...Object.fromEntries(fd) }),
    });
    setBusy(null);
    router.refresh();
  }

  async function recordPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy("pay");
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: member.id, ...Object.fromEntries(fd) }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h3 className="mb-3 font-semibold">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={toggleStatus} disabled={busy === "status"} className="btn btn-outline">
            {member.status === "ACTIVE" ? "Mark Inactive" : "Mark Active"}
          </button>
          <button onClick={sendDue} disabled={busy === "due"} className="btn btn-outline">
            Send Due Reminder
          </button>
        </div>
        {pending > 0 && <div className="mt-3 text-sm text-red-600">Balance due: {inr(pending)}</div>}
      </div>

      <form onSubmit={assignPlan} className="card space-y-3 p-5">
        <h3 className="font-semibold">Assign / Renew Plan</h3>
        <div>
          <label className="label">Plan</label>
          <select required name="planId" className="input">
            <option value="">Select plan</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name} · {inr(p.price)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Start Date</label>
          <input name="startDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="input" required />
        </div>
        <button disabled={busy === "plan"} className="btn btn-primary w-full">
          {busy === "plan" ? "Assigning..." : "Assign Plan"}
        </button>
      </form>

      <form onSubmit={recordPayment} className="card space-y-3 p-5">
        <h3 className="font-semibold">Record Payment</h3>
        <div>
          <label className="label">Amount</label>
          <input name="amount" type="number" step="1" min="1" className="input" required />
        </div>
        <div>
          <label className="label">Method</label>
          <select name="method" className="input" defaultValue="UPI">
            <option>CASH</option><option>UPI</option><option>CARD</option><option>BANK</option>
          </select>
        </div>
        <div>
          <label className="label">Note</label>
          <input name="note" className="input" />
        </div>
        <button disabled={busy === "pay"} className="btn btn-primary w-full">
          {busy === "pay" ? "Saving..." : "Record Payment"}
        </button>
      </form>
    </div>
  );
}
