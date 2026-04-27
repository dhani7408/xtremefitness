import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";
import { CheckCircle2 } from "lucide-react";

export const metadata = { title: "About — Xtreme Fitness" };

export default function AboutPage() {
  const pillars = [
    "Modern, imported equipment across strength, cardio and functional zones.",
    "Certified, passionate trainers who care about your form and progress.",
    "ESSL fingerprint secured access for a safe, members-only environment.",
    "Hygienic, air-conditioned, and spacious facility for everyone.",
  ];

  return (
    <>
      <PageHero
        title="About Xtreme"
        subtitle="Mohali's premium unisex gym in Sector 115 — built around real results and a real community."
        image="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1800&auto=format&fit=crop"
      />

      {/* Story */}
      <section className="bg-white py-20">
        <div className="section grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <Reveal>
            <div className="overflow-hidden rounded-3xl shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1200&auto=format&fit=crop"
                alt="Inside Xtreme Fitness"
                className="h-[420px] w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
                Our story
              </div>
              <h2 className="font-display text-4xl font-extrabold">
                More than a gym — a fitness <span className="text-brand">movement.</span>
              </h2>
              <p className="mt-4 text-ink-700">
                Founded by <b>Bikramjeet</b> and <b>Sunit Kumar</b>, Xtreme Fitness was born from a simple idea:
                Mohali deserves a world-class gym that welcomes everyone — from first-timers to athletes.
              </p>
              <p className="mt-4 text-ink-700">
                Today, we combine imported strength and cardio equipment with certified trainers and group
                classes — including Zumba, Aerobics, HIIT and Yoga — to give you a complete fitness experience
                under one roof.
              </p>
              <ul className="mt-6 space-y-3">
                {pillars.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section
        className="parallax-bg py-20 text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(11,11,13,0.8), rgba(11,11,13,0.8)), url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1800&auto=format&fit=crop)",
        }}
      >
        <div className="section grid grid-cols-2 gap-10 text-center md:grid-cols-4">
          {[
            ["500+", "Active Members"],
            ["10+", "Certified Trainers"],
            ["4.8★", "Justdial Rating"],
            ["12h", "Daily Opening"],
          ].map(([n, l]) => (
            <Reveal key={l}>
              <div>
                <div className="font-display text-4xl font-extrabold md:text-5xl">{n}</div>
                <div className="mt-2 text-xs uppercase tracking-widest text-white/60">{l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
