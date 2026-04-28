"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type EditMemberInitial = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  gender: string | null;
  dob: string | null;
  address: string | null;
  emergencyNo: string | null;
  status: string;
  fingerprintId: string | null;
  notes: string | null;
};

export default function EditMemberForm({ member }: { member: EditMemberInitial }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());
    const res = await fetch(`/api/members/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(raw),
    });
    setLoading(false);
    if (res.ok) {
      router.push(`/admin/members/${member.id}`);
      router.refresh();
    } else {
      setErr((await res.json()).error || "Failed");
    }
  }

  const dobValue = member.dob ? member.dob.slice(0, 10) : "";

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Edit member</h1>
      {err && <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      <form onSubmit={onSubmit} className="card grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        <div><label className="label">First Name *</label><input required name="firstName" className="input" defaultValue={member.firstName} /></div>
        <div><label className="label">Last Name</label><input name="lastName" className="input" defaultValue={member.lastName} /></div>
        <div><label className="label">Phone *</label><input required name="phone" className="input" defaultValue={member.phone} /></div>
        <div><label className="label">Email</label><input name="email" type="email" className="input" defaultValue={member.email ?? ""} /></div>
        <div>
          <label className="label">Gender</label>
          <select name="gender" className="input" defaultValue={member.gender ?? ""}>
            <option value="">Select</option>
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
        <div><label className="label">Date of Birth</label><input name="dob" type="date" className="input" defaultValue={dobValue} /></div>
        <div className="md:col-span-2"><label className="label">Address</label><input name="address" className="input" defaultValue={member.address ?? ""} /></div>
        <div><label className="label">Emergency Contact</label><input name="emergencyNo" className="input" defaultValue={member.emergencyNo ?? ""} /></div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={member.status} className="input">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        <div className="md:col-span-2"><label className="label">ESSL Fingerprint ID</label><input name="fingerprintId" className="input" placeholder="PIN enrolled on the ESSL device" defaultValue={member.fingerprintId ?? ""} /></div>
        <div className="md:col-span-2"><label className="label">Notes</label><textarea name="notes" className="input min-h-[88px]" rows={3} defaultValue={member.notes ?? ""} /></div>
        <div className="md:col-span-2 flex justify-end gap-2">
          <button type="button" onClick={() => router.back()} className="btn btn-outline">Cancel</button>
          <button disabled={loading} className="btn btn-primary">{loading ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </div>
  );
}
