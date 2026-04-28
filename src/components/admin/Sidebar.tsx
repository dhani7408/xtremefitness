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

export default function Sidebar() {
  const path = usePathname();
  const { data } = useSession();
  const role = normalizeAdminRole(data?.user?.role);
  const isManager = role === "MANAGER";
  const items = isManager ? allItems.filter((i) => !i.superOnly) : allItems;

  return (
    <aside className="hidden w-60 shrink-0 border-r border-black/5 bg-ink-900 text-white md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4 font-extrabold">
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
        onClick={() => signOut({ callbackUrl: "/" })}
        className="m-3 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </aside>
  );
}
