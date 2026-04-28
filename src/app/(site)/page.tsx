import Link from "next/link";
import { Dumbbell, Heart, Star, Users, ShieldCheck, Activity, ArrowRight, Quote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ParallaxHero from "@/components/site/ParallaxHero";
import Reveal from "@/components/site/Reveal";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [galleryPreview, trainers] = await Promise.all([
    prisma.galleryImage.findMany({
      where: { deletedAt: null, active: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.teamMember.findMany({
      where: { deletedAt: null, status: "ACTIVE", role: { in: ["OWNER", "TRAINER"] } },
      orderBy: [{ role: "asc" }],
      take: 3,
    }),
  ]);
  const testimonials = [
    {
      name: "Karan Mehta",
      text: "Best gym in Sector 115. Equipment is top notch and the trainers actually care about your form and progress.",
      role: "Member since 2023",
    },
    {
      name: "Simran Kaur",
      text: "I love the Zumba and Yoga classes here. Super friendly vibe and the place is always spotless.",
      role: "Member since 2024",
    },
    {
      name: "Arjun Patel",
      text: "Rakesh sir's personal training changed my physique completely. Lost 12kg in 5 months!",
      role: "Transformation member",
    },
  ];

  return (
    <>
      {/* Parallax hero */}
      <ParallaxHero />

      {/* Marquee strip */}
      <div className="overflow-hidden border-y border-white/5 bg-ink-900 py-5 text-white">
        <div className="marquee-track flex w-max whitespace-nowrap gap-12 text-2xl font-extrabold uppercase tracking-widest md:text-3xl">
          {Array.from({ length: 2 }).flatMap((_, i) => [
            <span key={`${i}-1`} className="text-white/90">Strength</span>,
            <span key={`${i}-2`} className="text-brand">✦</span>,
            <span key={`${i}-3`} className="text-white/90">Cardio</span>,
            <span key={`${i}-4`} className="text-brand">✦</span>,
            <span key={`${i}-5`} className="text-white/90">Zumba</span>,
            <span key={`${i}-6`} className="text-brand">✦</span>,
            <span key={`${i}-7`} className="text-white/90">Yoga</span>,
            <span key={`${i}-8`} className="text-brand">✦</span>,
            <span key={`${i}-9`} className="text-white/90">HIIT</span>,
            <span key={`${i}-10`} className="text-brand">✦</span>,
            <span key={`${i}-11`} className="text-white/90">Aerobics</span>,
            <span key={`${i}-12`} className="text-brand">✦</span>,
          ])}
        </div>
      </div>

      {/* Features */}
      <section className="relative overflow-hidden bg-white py-24">
        <div className="section">
          <Reveal>
            <div className="text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
                Why Xtreme
              </div>
              <h2 className="font-display text-4xl font-extrabold md:text-5xl">
                Built for serious fitness.
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-ink-700">
                Everything you need to get stronger, leaner and happier — under one roof.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: Dumbbell, title: "Modern Equipment", desc: "Imported strength & cardio machines, free weights and functional training zones." },
              { icon: Users, title: "Group Classes", desc: "Zumba, Aerobics, Yoga and HIIT led by certified trainers throughout the week." },
              { icon: ShieldCheck, title: "Fingerprint Access", desc: "ESSL biometric entry. Only active members get access — your safety first." },
              { icon: Heart, title: "Personal Training", desc: "1-on-1 coaching with nutrition plans for measurable, life-changing results." },
              { icon: Activity, title: "Body Analysis", desc: "Periodic body composition, strength and progress assessments for every member." },
              { icon: Star, title: "Community", desc: "A motivating, welcoming unisex environment that lifts you up every single day." },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-black/5 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-brand/5 blur-2xl transition group-hover:bg-brand/20" />
                  <div className="relative mb-4 inline-flex rounded-xl bg-brand/10 p-3 text-brand">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="relative text-lg font-bold">{f.title}</h3>
                  <p className="relative mt-2 text-sm leading-6 text-ink-700">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Parallax quote banner */}
      <section
        className="parallax-bg relative py-28 text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(11,11,13,0.75), rgba(11,11,13,0.8)), url(https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1800&auto=format&fit=crop)",
        }}
      >
        <div className="section text-center">
          <Reveal>
            <Quote className="mx-auto h-10 w-10 text-brand" />
            <blockquote className="mx-auto mt-6 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
              &ldquo;The body achieves what the mind believes.&rdquo;
            </blockquote>
            <div className="mt-4 text-sm uppercase tracking-widest text-white/60">— Xtreme Way</div>
          </Reveal>
        </div>
      </section>

      {/* Gallery preview (dynamic) */}
      {galleryPreview.length > 0 && (
        <section className="bg-white py-24">
          <div className="section">
            <Reveal>
              <div className="mb-10 flex items-end justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
                    Inside the gym
                  </div>
                  <h2 className="font-display text-4xl font-extrabold md:text-5xl">
                    Built for <span className="text-brand">results.</span>
                  </h2>
                </div>
                <Link href="/gallery" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand">
                  View Gallery
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {galleryPreview.map((img, i) => (
                <Reveal key={img.id} delay={i * 50}>
                  <div className={`group relative overflow-hidden rounded-2xl ${i === 0 ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto md:h-full" : "aspect-square"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 transition group-hover:opacity-100" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="rounded-full bg-brand/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest">{img.category}</span>
                      <div className="mt-2 text-base font-semibold">{img.title}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trainers preview */}
      {trainers.length > 0 && (
        <section className="bg-gray-50 py-24">
          <div className="section">
            <Reveal>
              <div className="mb-10 text-center">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
                  Meet the team
                </div>
                <h2 className="font-display text-4xl font-extrabold md:text-5xl">
                  The people behind Xtreme.
                </h2>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {trainers.map((t, i) => (
                <Reveal key={t.id} delay={i * 100}>
                  <div className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div
                      className="h-72 w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url(${
                          t.photoUrl ||
                          "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800&auto=format&fit=crop"
                        })`,
                      }}
                    />
                    <div className="p-5">
                      <div className="text-xs font-semibold uppercase tracking-widest text-brand">
                        {t.role}
                      </div>
                      <div className="mt-1 text-xl font-bold">
                        {t.firstName} {t.lastName}
                      </div>
                      {t.bio && <p className="mt-2 text-sm text-ink-700">{t.bio}</p>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/trainers" className="btn btn-outline">
                Meet the full team
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="bg-white py-24">
        <div className="section">
          <Reveal>
            <div className="mb-12 text-center">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
                Members love us
              </div>
              <h2 className="font-display text-4xl font-extrabold md:text-5xl">
                Results that speak.
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <div className="relative h-full rounded-2xl border border-black/5 bg-gray-50 p-7">
                  <div className="mb-4 flex text-brand">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-ink-900">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-5 border-t border-black/5 pt-4">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-ink-700">{t.role}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Parallax CTA */}
      <section
        className="parallax-bg relative py-28 text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(220,38,38,0.8), rgba(11,11,13,0.9)), url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1800&auto=format&fit=crop)",
        }}
      >
        <div className="section text-center">
          <Reveal>
            <h2 className="font-display text-4xl font-extrabold md:text-6xl">
              Ready to become your strongest self?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/80">
              Book a free trial today and see why Xtreme Fitness is Mohali&apos;s favourite gym.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn btn-primary bg-white text-ink-900 hover:bg-white/90 shadow-glow">
                Book Free Trial
              </Link>
              <Link href="/pricing" className="btn btn-outline-inverse">
                View Plans
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
