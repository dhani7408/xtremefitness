"use client";
import Link from "next/link";
import { useState } from "react";
import { Dumbbell, Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/classes", label: "Classes" },
  { href: "/trainers", label: "Trainers" },
  { href: "/gallery", label: "Gallery" },
  { href: "/pricing", label: "Membership" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-ink-900/90 text-white backdrop-blur">
      <div className="section flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
          <Dumbbell className="h-6 w-6 text-brand" />
          <span>
            XTREME<span className="text-brand">FITNESS</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-white/80 transition hover:text-white">
              {l.label}
            </Link>
          ))}
          <Link href="/admin" className="btn btn-primary">
            Admin Login
          </Link>
        </nav>
        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-ink-900 md:hidden">
          <div className="section flex flex-col gap-1 py-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded px-2 py-2 text-sm text-white/90 hover:bg-white/5" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link href="/admin" className="btn btn-primary mt-2" onClick={() => setOpen(false)}>
              Admin Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
