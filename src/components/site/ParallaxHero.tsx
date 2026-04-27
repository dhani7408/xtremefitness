"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Flame } from "lucide-react";

export default function ParallaxHero() {
  const bgRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (bgRef.current) {
          bgRef.current.style.transform = `translate3d(0, ${y * 0.35}px, 0) scale(1.1)`;
        }
        if (fgRef.current) {
          fgRef.current.style.transform = `translate3d(0, ${y * -0.15}px, 0)`;
          fgRef.current.style.opacity = `${Math.max(0, 1 - y / 600)}`;
        }
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative h-[92vh] overflow-hidden bg-ink-900 text-white">
      {/* Background image with parallax */}
      <div
        ref={bgRef}
        className="absolute inset-0 -z-10 bg-cover bg-center will-change-transform"
        style={{
          backgroundImage:
            "linear-gradient(rgba(11,11,13,0.55), rgba(11,11,13,0.85)), url(https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1800&auto=format&fit=crop)",
        }}
      />
      {/* Accent gradient overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_85%_0%,rgba(220,38,38,0.45),transparent_60%),radial-gradient(40%_60%_at_0%_100%,rgba(220,38,38,0.3),transparent_60%)]" />

      {/* Foreground content */}
      <div ref={fgRef} className="section relative z-10 flex h-full flex-col items-center justify-center text-center will-change-transform">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs backdrop-blur">
          <Flame className="h-3.5 w-3.5 text-brand" />
          <span>Rated 4.8/5 on Justdial · 57+ reviews</span>
        </span>
        <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] md:text-7xl lg:text-[5.5rem]">
          Train like you mean it.
          <br />
          <span className="bg-gradient-to-r from-brand via-red-500 to-orange-400 bg-clip-text text-transparent">
            Welcome to Xtreme.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
          Mohali&apos;s premium unisex gym in Sector 115. Modern equipment, certified trainers,
          fingerprint secured access, and group classes that actually move you.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/pricing" className="btn btn-primary px-6 py-3 text-base shadow-glow">
            Join Now
          </Link>
          <Link
            href="/gallery"
            className="btn btn-outline border-white/20 px-6 py-3 text-base text-white hover:bg-white/10"
          >
            View Gallery
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-10 text-center">
          {[
            ["500+", "Members"],
            ["10+", "Trainers"],
            ["4.8★", "Rated"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="text-3xl font-extrabold md:text-4xl">{n}</div>
              <div className="text-xs uppercase tracking-widest text-white/60">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/50">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/30 p-1">
          <div className="h-2 w-1 animate-bounce rounded-full bg-white/80" />
        </div>
      </div>
    </section>
  );
}
