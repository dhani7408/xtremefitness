"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GalleryForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd)),
    });
    setLoading(false);
    if (res.ok) {
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      setErr((await res.json()).error || "Failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {err && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      <div>
        <label className="label">Title</label>
        <input name="title" required className="input" placeholder="e.g. Cardio Zone" />
      </div>
      <div>
        <label className="label">Image URL</label>
        <input name="url" required className="input" placeholder="https://..." />
        <p className="mt-1 text-xs text-ink-700">Paste a public image URL (Unsplash, CDN, etc.).</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <select name="category" className="input" defaultValue="GYM">
            <option>GYM</option>
            <option>CLASSES</option>
            <option>EVENTS</option>
            <option>TEAM</option>
          </select>
        </div>
        <div>
          <label className="label">Order</label>
          <input name="order" type="number" defaultValue={0} className="input" />
        </div>
      </div>
      <button disabled={loading} className="btn btn-primary w-full">
        {loading ? "Saving..." : "Add Image"}
      </button>
    </form>
  );
}
