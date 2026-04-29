"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Wallet,
  Fingerprint,
  MessageSquare,
  LogOut,
  Dumbbell,
  Package,
  Image as ImageIcon,
  Banknote,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { normalizeAdminRole } from "@/lib/roles";

const allItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, superOnly: true },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/pending-payments", label: "Pending payments", icon: Banknote },
  { href: "/admin/team", label: "Team", icon: UserCog, superOnly: true },
  { href: "/admin/plans", label: "Plans", icon: Package },
  { href: "/admin/finance", label: "Finance", icon: Wallet, superOnly: true },
  { href: "/admin/attendance", label: "Attendance", icon: Fingerprint, superOnly: true },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon, superOnly: true },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, superOnly: true },
];

export default function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const path = usePathname();
  const { data } = useSession();
  const role = normalizeAdminRole(data?.user?.role);
  const isManager = role === "MANAGER";
  const items = isManager ? allItems.filter((i) => !i.superOnly) : allItems;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-black/5 bg-ink-900 text-white md:flex md:flex-col">
        <SidebarContent
          items={items}
          path={path}
          onNavigate={onClose}
          onSignOut={() => signOut({ callbackUrl: "/" })}
        />
      </aside>

      {/* Mobile drawer + backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-black/5 bg-ink-900 text-white transition-transform md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-2 font-extrabold">
            <Dumbbell className="h-5 w-5 text-brand" />
            XTREME<span className="text-brand">FITNESS</span>
          </div>
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContent
          items={items}
          path={path}
          onNavigate={onClose}
          onSignOut={() => signOut({ callbackUrl: "/" })}
        />
      </aside>
    </>
  );
}

function SidebarContent({
  items,
  path,
  onNavigate,
  onSignOut,
}: {
  items: typeof allItems;
  path: string;
  onNavigate?: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      <div className="hidden h-16 items-center gap-2 border-b border-white/10 px-4 font-extrabold md:flex">
        <Dumbbell className="h-5 w-5 text-brand" />
        XTREME<span className="text-brand">FITNESS</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((i) => {
          const active = path === i.href || (i.href !== "/admin" && path.startsWith(i.href));
          return (
            <Link
              key={i.href}
              href={i.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-brand text-white" : "text-white/80 hover:bg-white/5"
              }`}
            >
              <i.icon className="h-4 w-4" />
              {i.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={onSignOut}
        className="m-3 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </>
  );
}
