"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Broadcast() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/messages/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd)),
    });
    setLoading(false);
    if (res.ok) {
      const d = await res.json();
      setMsg(`Queued ${d.count} messages.`);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      setMsg("Failed");
    }
  }
  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-5">
      <h3 className="font-semibold">Send Broadcast / Holiday Notice</h3>
      <div>
        <label className="label">Audience</label>
        <select name="audience" className="input" defaultValue="ACTIVE">
          <option value="ACTIVE">Active members only</option>
          <option value="ALL">All members</option>
          <option value="TEAM">Team</option>
        </select>
      </div>
      <div>
        <label className="label">Kind</label>
        <select name="kind" className="input" defaultValue="BROADCAST">
          <option value="BROADCAST">General Broadcast</option>
          <option value="HOLIDAY">Holiday Notice</option>
        </select>
      </div>
      <div>
        <label className="label">Message</label>
        <textarea name="body" rows={5} required className="input" placeholder="Hi! The gym will be closed tomorrow for Holi. Stay safe!" />
      </div>
      <button disabled={loading} className="btn btn-primary w-full">
        {loading ? "Sending..." : "Send Broadcast"}
      </button>
      {msg && <div className="text-sm text-ink-700">{msg}</div>}
    </form>
  );
}
