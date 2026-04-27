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
