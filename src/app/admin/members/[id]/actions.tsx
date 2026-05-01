"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { inr, paymentInvoiceHref, paymentTypeLabel } from "@/lib/utils";
import InvoiceDownloadLink from "@/components/admin/InvoiceDownloadLink";

type PlanRef = { name: string };
type SubRow = {
  id: string;
  startDate: string;
  endDate: string;
  amount: number;
  amountPaid: number;
  plan: PlanRef;
};

type MemberRow = {
  id: string;
  status: string;
  subscriptions: SubRow[];
};

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export default function MemberActions({
  member,
  plans,
  isSuperUser,
}: {
  member: MemberRow;
  plans: { id: string; name: string; price: number }[];
  isSuperUser: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [payBanner, setPayBanner] = useState<{ paymentId: string; payType: string; invoiceNo: string } | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  const now = useMemo(() => new Date(), []);

  const activeSubs = useMemo(
    () =>
      member.subscriptions
        .filter((s) => new Date(s.endDate) >= now)
        .slice()
        .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()),
    [member.subscriptions, now]
  );

  const subsWithDue = useMemo(
    () =>
      member.subscriptions.filter((s) => roundMoney(s.amount - s.amountPaid) > 0.001),
    [member.subscriptions]
  );

  const totalDue = useMemo(
    () => member.subscriptions.reduce((acc, s) => acc + roundMoney(Math.max(0, s.amount - s.amountPaid)), 0),
    [member.subscriptions]
  );

  const [subId, setSubId] = useState("");
  useEffect(() => {
    if (subsWithDue.length && !subsWithDue.some((s) => s.id === subId)) {
      setSubId(subsWithDue[0].id);
    }
    if (!subsWithDue.length) setSubId("");
  }, [subsWithDue, subId]);

  const selected = member.subscriptions.find((s) => s.id === subId);
  const dueSelected = selected ? roundMoney(selected.amount - selected.amountPaid) : 0;

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
    setPayBanner(null);
    setBusy("pay");
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());
    const res = await fetch(`/api/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: member.id, ...raw }),
    });
    setBusy(null);
    if (res.ok) {
      const j = (await res.json()) as { id: string; payType: string; invoiceNo: string };
      setPayBanner({ paymentId: j.id, payType: j.payType, invoiceNo: j.invoiceNo });
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      alert((j as { error?: string }).error || "Payment failed");
    }
  }

  async function saveDates(subId: string) {
    setBusy("edit-sub");
    const res = await fetch(`/api/subscriptions/${subId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: editStart, endDate: editEnd }),
    });
    setBusy(null);
    if (res.ok) {
      setEditingSubId(null);
      router.refresh();
    } else {
      alert("Failed to update dates");
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h3 className="mb-2 font-semibold">Active membership</h3>
        {activeSubs.length === 0 ? (
          <p className="text-sm text-ink-700">No active plan (all subscriptions ended).</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {activeSubs.map((s) => {
              const due = roundMoney(s.amount - s.amountPaid);
              const isEditing = editingSubId === s.id;

              return (
                <li key={s.id} className="rounded-lg border border-black/5 bg-gray-50 px-3 py-2">
                  <div className="flex items-start justify-between">
                    <div className="font-medium text-ink-900">{s.plan.name}</div>
                    {isSuperUser && !isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSubId(s.id);
                          setEditStart(new Date(s.startDate).toISOString().slice(0, 10));
                          setEditEnd(new Date(s.endDate).toISOString().slice(0, 10));
                        }}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        Edit dates
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] uppercase text-ink-700">Start Date</label>
                          <input
                            type="date"
                            className="input text-xs py-1 h-8"
                            value={editStart}
                            onChange={(e) => setEditStart(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase text-ink-700">End Date</label>
                          <input
                            type="date"
                            className="input text-xs py-1 h-8"
                            value={editEnd}
                            onChange={(e) => setEditEnd(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          disabled={busy === "edit-sub"}
                          onClick={() => saveDates(s.id)}
                          className="btn btn-primary text-xs py-1 h-8"
                        >
                          {busy === "edit-sub" ? "..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingSubId(null)}
                          className="btn btn-outline text-xs py-1 h-8"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-ink-700">
                      Valid {new Date(s.startDate).toLocaleDateString("en-IN")} —{" "}
                      {new Date(s.endDate).toLocaleDateString("en-IN")}
                      <br />
                      Paid {inr(s.amountPaid)} / {inr(s.amount)}
                    </div>
                  )}

                  {due > 0.001 ? (
                    <div className="mt-1 font-semibold text-brand">Due on this plan: {inr(due)}</div>
                  ) : (
                    <div className="mt-1 text-xs font-medium text-green-700">Fully paid</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-4 border-t border-black/5 pt-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-700">Total balance due</div>
          <div className={`mt-1 text-lg font-bold ${totalDue > 0.001 ? "text-brand" : "text-green-700"}`}>
            {totalDue > 0.001 ? inr(totalDue) : "₹0 — all plans paid"}
          </div>
        </div>
      </div>

      {isSuperUser && (
        <div className="card p-5">
          <h3 className="mb-3 font-semibold">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={toggleStatus} disabled={busy === "status"} className="btn btn-outline">
              {member.status === "ACTIVE" ? "Mark Inactive" : "Mark Active"}
            </button>
            <button type="button" onClick={sendDue} disabled={busy === "due"} className="btn btn-outline">
              Send Due Reminder
            </button>
          </div>
        </div>
      )}

      {isSuperUser && plans.length > 0 && (
        <form onSubmit={assignPlan} className="card space-y-3 p-5">
          <h3 className="font-semibold">Assign / Renew Plan</h3>
          <div>
            <label className="label">Plan</label>
            <select required name="planId" className="input">
              <option value="">Select plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {inr(p.price)}
                </option>
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
      )}

      <form onSubmit={recordPayment} className="card space-y-3 p-5">
        <h3 className="font-semibold">Record payment</h3>
        <p className="text-xs text-ink-700">
          Choose which plan the payment applies to. Enter any amount up to the balance due — if you pay the full
          remaining amount, it is stored as a <strong>full</strong> payment; otherwise <strong>partial</strong>. Each
          entry gets a printable invoice.
        </p>
        {subsWithDue.length === 0 ? (
          <p className="text-sm text-ink-700">No outstanding balance on any subscription.</p>
        ) : (
          <>
            <div>
              <label className="label">Apply payment to</label>
              <select
                name="subscriptionId"
                required
                className="input"
                value={subId}
                onChange={(e) => setSubId(e.target.value)}
              >
                {subsWithDue.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.plan.name} — due {inr(roundMoney(s.amount - s.amountPaid))}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Amount (₹)</label>
              <input
                key={subId}
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={dueSelected > 0 ? roundMoney(dueSelected) : undefined}
                className="input"
                required
                defaultValue={dueSelected > 0 ? roundMoney(dueSelected) : ""}
              />
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-xs text-ink-700">Balance due for this plan: {inr(dueSelected)}</span>
                <button
                  type="button"
                  className="text-xs font-semibold text-brand hover:underline"
                  onClick={(e) => {
                    const form = e.currentTarget.closest("form");
                    const inp = form?.querySelector<HTMLInputElement>('input[name="amount"]');
                    if (inp && dueSelected > 0) inp.value = String(roundMoney(dueSelected));
                  }}
                >
                  Fill full due
                </button>
              </div>
            </div>
            <div>
              <label className="label">Method</label>
              <select name="method" className="input" defaultValue="UPI">
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="CARD">CARD</option>
                <option value="BANK">BANK</option>
              </select>
            </div>
            <div>
              <label className="label">Note (optional)</label>
              <input name="note" className="input" placeholder="e.g. April installment" />
            </div>
            <button disabled={busy === "pay"} className="btn btn-primary w-full">
              {busy === "pay" ? "Saving…" : "Record payment & create invoice"}
            </button>
          </>
        )}
        {payBanner && (
          <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            <span className="font-semibold text-ink-900">{paymentTypeLabel(payBanner.payType).text}</span> recorded.{" "}
            <Link
              className="font-semibold text-brand hover:underline"
              href={paymentInvoiceHref(payBanner.paymentId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open
            </Link>
            {" · "}
            <InvoiceDownloadLink paymentId={payBanner.paymentId} invoiceNo={payBanner.invoiceNo} />
            <span className="mt-1 block text-xs text-green-900/80">
              Generating PDF directly from the browser for a faster experience.
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
