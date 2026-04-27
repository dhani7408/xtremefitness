"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ExpenseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd)),
    });
    setLoading(false);
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div><label className="label">Title</label><input name="title" required className="input" /></div>
      <div>
        <label className="label">Category</label>
        <select name="category" className="input">
          <option>RENT</option><option>SALARY</option><option>UTILITIES</option>
          <option>EQUIPMENT</option><option>OTHER</option>
        </select>
      </div>
      <div><label className="label">Amount (₹)</label><input name="amount" type="number" required className="input" /></div>
      <div><label className="label">Note</label><input name="note" className="input" /></div>
      <button disabled={loading} className="btn btn-primary w-full">{loading ? "Saving..." : "Add Expense"}</button>
    </form>
  );
}
