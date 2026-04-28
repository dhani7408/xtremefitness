import type { Session } from "next-auth";

/** Legacy DB rows may still use ADMIN — treat as full access. */
export function normalizeAdminRole(role: string | undefined | null): string {
  if (!role) return "";
  if (role === "ADMIN") return "SUPER_ADMIN";
  return role;
}

export function isSuperAdmin(role: string | undefined | null): boolean {
  const r = normalizeAdminRole(role);
  return r === "SUPER_ADMIN";
}

export function isManager(role: string | undefined | null): boolean {
  return normalizeAdminRole(role) === "MANAGER";
}

export function getRoleFromSession(session: Session | null): string {
  return normalizeAdminRole((session?.user as { role?: string } | undefined)?.role);
}

/** Paths a MANAGER may visit under `/admin` (keep in sync with middleware). */
export function isManagerAllowedAdminPath(pathname: string): boolean {
  if (pathname.startsWith("/admin/plans")) return true;
  if (pathname.startsWith("/admin/pending-payments")) return true;
  if (pathname === "/admin/members") return true;
  if (/^\/admin\/members\/[^/]+\/edit$/.test(pathname)) return true;
  if (/^\/admin\/members\/[^/]+$/.test(pathname)) {
    return !pathname.startsWith("/admin/members/new");
  }
  return false;
}

/**
 * After login, only allow in-app redirects under /admin.
 * Managers cannot land on /admin (dashboard) or other super-only routes — send them to members.
 */
export function safeAdminPostLoginRedirect(callbackUrl: string | null, role: string | undefined | null): string {
  const r = normalizeAdminRole(role);
  const fallback = isManager(r) ? "/admin/members" : "/admin";
  if (!callbackUrl || typeof callbackUrl !== "string") return fallback;
  const trimmed = callbackUrl.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  try {
    const u = new URL(trimmed, "http://local.invalid");
    const path = u.pathname;
    if (!path.startsWith("/admin")) return fallback;
    if (isManager(r) && !isManagerAllowedAdminPath(path)) return fallback;
    return path + u.search;
  } catch {
    return fallback;
  }
}
