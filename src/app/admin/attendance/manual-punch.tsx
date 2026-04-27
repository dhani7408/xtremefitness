"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ManualPunch() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/attendance/punch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd)),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setMsg(data.allowed ? "Allowed ✔" : `Denied: ${data.denyReason}`);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      setMsg((await res.json()).error || "Failed");
    }
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
      <div className="w-40">
        <label className="label">Fingerprint ID</label>
        <input name="fingerprintId" required className="input" placeholder="eg. PIN1" />
      </div>
      <button disabled={loading} className="btn btn-primary">
        {loading ? "Punching..." : "Punch In"}
      </button>
      {msg && <span className="text-sm">{msg}</span>}
    </form>
  );
}
