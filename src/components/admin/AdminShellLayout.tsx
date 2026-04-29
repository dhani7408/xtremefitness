"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminShellLayout({
  children,
  roleLabel,
}: {
  children: React.ReactNode;
  roleLabel: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 text-ink-900">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-h-screen w-full flex-col">
        <header className="flex h-16 items-center justify-between border-b border-black/5 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open admin menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="font-semibold">Admin Panel</div>
          </div>
          <div className="flex items-center gap-3 text-sm text-ink-700">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-ink-900">
              {roleLabel}
            </span>
            <span className="hidden sm:inline">Xtreme Fitness Gym</span>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

