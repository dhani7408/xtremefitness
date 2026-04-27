import { prisma } from "@/lib/prisma";
import { inr } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";
import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";

export const metadata = { title: "Membership — Xtreme Fitness" };
export const dynamic = "force-dynamic";

const perks = [
  "Access to all equipment",
  "Group classes included",
  "Locker room & changing area",
  "Fingerprint secured access",
];

export default async function PricingPage() {
  const plans = await prisma.plan.findMany({
    where: { active: true, deletedAt: null },
    orderBy: { months: "asc" },
  });
  return (
    <>
      <PageHero
        title="Membership Plans"
        subtitle="Simple, transparent pricing. Choose a plan and start your transformation."
        image="https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=1800&auto=format&fit=crop"
      />
      <section className="bg-white py-20">
        <div className="section">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <div
                  className={`relative h-full overflow-hidden rounded-2xl border p-7 transition hover:-translate-y-1 hover:shadow-xl ${
                    i === 1
                      ? "border-brand bg-ink-900 text-white shadow-xl"
                      : "border-black/5 bg-white shadow-sm"
                  }`}
                >
                  {i === 1 && (
                    <>
                      <span className="absolute right-4 top-4 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                        Most Popular
                      </span>
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/30 blur-3xl" />
                    </>
                  )}
                  <div className={`text-xs font-semibold uppercase tracking-widest ${i === 1 ? "text-brand" : "text-ink-700"}`}>
                    {p.name}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold">{inr(p.price)}</span>
                  </div>
                  <div className={`text-xs ${i === 1 ? "text-white/70" : "text-ink-700"}`}>
                    for {p.months} month{p.months > 1 ? "s" : ""}
                  </div>
                  <ul className="mt-6 space-y-2.5 text-sm">
                    {perks.map((pk) => (
                      <li key={pk} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-brand" /> {pk}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={`btn mt-8 w-full ${i === 1 ? "btn-primary shadow-glow" : "btn-outline"}`}
                  >
                    Enquire
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
