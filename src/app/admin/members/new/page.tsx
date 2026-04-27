"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd.entries())),
    });
    setLoading(false);
    if (res.ok) {
      const m = await res.json();
      router.push(`/admin/members/${m.id}`);
    } else {
      setErr((await res.json()).error || "Failed");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Add Member</h1>
      {err && <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      <form onSubmit={onSubmit} className="card grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        <div><label className="label">First Name *</label><input required name="firstName" className="input" /></div>
        <div><label className="label">Last Name</label><input name="lastName" className="input" /></div>
        <div><label className="label">Phone *</label><input required name="phone" className="input" /></div>
        <div><label className="label">Email</label><input name="email" type="email" className="input" /></div>
        <div>
          <label className="label">Gender</label>
          <select name="gender" className="input">
            <option value="">Select</option>
            <option>MALE</option><option>FEMALE</option><option>OTHER</option>
          </select>
        </div>
        <div><label className="label">Date of Birth</label><input name="dob" type="date" className="input" /></div>
        <div className="md:col-span-2"><label className="label">Address</label><input name="address" className="input" /></div>
        <div><label className="label">Emergency Contact</label><input name="emergencyNo" className="input" /></div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue="ACTIVE" className="input">
            <option>ACTIVE</option><option>INACTIVE</option>
          </select>
        </div>
        <div className="md:col-span-2"><label className="label">ESSL Fingerprint ID</label><input name="fingerprintId" className="input" placeholder="PIN enrolled on the ESSL device" /></div>
        <div className="md:col-span-2 flex justify-end gap-2">
          <button type="button" onClick={() => router.back()} className="btn btn-outline">Cancel</button>
          <button disabled={loading} className="btn btn-primary">{loading ? "Saving..." : "Save Member"}</button>
        </div>
      </form>
    </div>
  );
}
