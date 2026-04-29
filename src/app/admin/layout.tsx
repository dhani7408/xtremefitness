import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminShellLayout from "@/components/admin/AdminShellLayout";
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
    <>
      {session ? (
        <AdminShellLayout roleLabel={roleLabel}>{children}</AdminShellLayout>
      ) : (
        <LoginOrRedirect>{children}</LoginOrRedirect>
      )}
    </>
  );
}

async function LoginOrRedirect({ children }: { children: React.ReactNode }) {
  // If user hits any /admin path without session, redirect to /admin/login
  // except when they're already on /admin/login, in which case show it.
  // We can't read path here directly; next.js middleware does the redirect instead.
  return <>{children}</>;
}
