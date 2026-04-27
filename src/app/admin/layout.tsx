import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";
import { normalizeAdminRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const roleLabel: string =
    session?.user != null && normalizeAdminRole(session.user.role) === "MANAGER"
      ? "Manager"
      : "Super admin";

  return (
    <div className="flex min-h-screen bg-gray-50 text-ink-900">
      {session && <Sidebar />}
      <div className="flex min-h-screen w-full flex-col">
        {session ? (
          <AdminShell roleLabel={roleLabel}>{children}</AdminShell>
        ) : (
          <LoginOrRedirect>{children}</LoginOrRedirect>
        )}
      </div>
    </div>
  );
}

function AdminShell({ children, roleLabel }: { children: React.ReactNode; roleLabel: string }) {
  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-black/5 bg-white px-6">
        <div className="font-semibold">Admin Panel</div>
        <div className="flex items-center gap-3 text-sm text-ink-700">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-ink-900">
            {roleLabel}
          </span>
          <span>Xtreme Fitness Gym</span>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </>
  );
}

async function LoginOrRedirect({ children }: { children: React.ReactNode }) {
  // If user hits any /admin path without session, redirect to /admin/login
  // except when they're already on /admin/login, in which case show it.
  // We can't read path here directly; next.js middleware does the redirect instead.
  return <>{children}</>;
}
