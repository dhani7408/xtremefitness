"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PlanForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/plans", {
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
      <div><label className="label">Name</label><input name="name" required className="input" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Months</label><input name="months" type="number" required defaultValue={1} className="input" /></div>
        <div><label className="label">Price (₹)</label><input name="price" type="number" required className="input" /></div>
      </div>
      <button disabled={loading} className="btn btn-primary w-full">{loading ? "Saving..." : "Save Plan"}</button>
    </form>
  );
}
