import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { isManager, isManagerAllowedAdminPath } from "@/lib/roles";

const adminAuth = withAuth(
  function middleware(req) {
    const role = (req.nextauth.token?.role as string) || "";
    const r = role === "ADMIN" ? "SUPER_ADMIN" : role;
    if (r === "MANAGER") {
      const path = req.nextUrl.pathname;
      if (path === "/admin" || path === "/admin/") {
        return NextResponse.redirect(new URL("/admin/members", req.url));
      }
      if (!isManagerAllowedAdminPath(path)) {
        return NextResponse.redirect(new URL("/admin/members", req.url));
      }
    }
    return NextResponse.next();
  },
  {
    pages: { signIn: "/admin/login" },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const p = req.nextUrl.pathname;
  if (p === "/admin/login" || p.startsWith("/admin/login/")) {
    const secret = process.env.NEXTAUTH_SECRET;
    if (secret) {
      const token = await getToken({ req, secret });
      if (token) {
        if (isManager((token.role as string) || null)) {
          return NextResponse.redirect(new URL("/admin/members", req.url));
        }
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
    return NextResponse.next();
  }
  return adminAuth(req as Parameters<typeof adminAuth>[0], event);
}

export const config = {
  matcher: ["/admin/:path*"],
};
