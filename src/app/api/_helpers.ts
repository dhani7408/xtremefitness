import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { getRoleFromSession, isSuperAdmin } from "@/lib/roles";

export async function requireAuth(): Promise<{ session: Session; error: null } | { session: null; error: NextResponse }> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function requireSuperAdmin() {
  const result = await requireAuth();
  if (result.error) return result;
  if (!isSuperAdmin(getRoleFromSession(result.session))) {
    return { session: result.session, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session: result.session, error: null };
}

export { getRoleFromSession, isSuperAdmin };

export function nextCode(prefix: string) {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${n}`;
}
