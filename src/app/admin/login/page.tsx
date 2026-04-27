"use client";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Dumbbell } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push(params.get("callbackUrl") || "/admin");
      router.refresh();
    } else {
      setErr("Invalid email or password");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-2 text-2xl font-extrabold">
          <Dumbbell className="h-7 w-7 text-brand" />
          XTREME<span className="text-brand">FITNESS</span>
        </div>
        <h1 className="text-xl font-bold">Admin Login</h1>
        <p className="mb-4 text-sm text-ink-700">Sign in to manage the gym.</p>
        {err && <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
        <div className="space-y-3">
          <div>
            <label className="label">Email</label>
            <input className="input" name="email" type="email" defaultValue="admin@xtremefitness.in" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" name="password" type="password" defaultValue="admin@123" required />
          </div>
        </div>
        <button disabled={loading} className="btn btn-primary mt-5 w-full">
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="mt-4 text-xs text-ink-700">
          Default: admin@xtremefitness.in / admin@123
        </p>
      </form>
    </div>
  );
}
