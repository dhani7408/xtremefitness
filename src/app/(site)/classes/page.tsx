import { Dumbbell, Music2, HeartPulse, Flame, Waves, Bike } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";

const classes = [
  {
    icon: Dumbbell,
    name: "Strength Training",
    desc: "Free weights, machines and functional training zones for raw power.",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200&auto=format&fit=crop",
    schedule: "Mon–Sat · 6 AM – 10 PM",
  },
  {
    icon: HeartPulse,
    name: "Cardio",
    desc: "Treadmills, ellipticals, cycles and rowers to torch calories.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop",
    schedule: "All open hours",
  },
  {
    icon: Music2,
    name: "Zumba",
    desc: "High-energy dance workouts that don't even feel like exercise.",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1200&auto=format&fit=crop",
    schedule: "Mon, Wed, Fri · 7 PM",
  },
  {
    icon: Flame,
    name: "HIIT",
    desc: "Short bursts. Big burn. Proven fat-loss interval training.",
    image: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?q=80&w=1200&auto=format&fit=crop",
    schedule: "Tue, Thu · 7 AM & 7 PM",
  },
  {
    icon: Waves,
    name: "Yoga",
    desc: "Guided yoga for flexibility, balance and mental clarity.",
    image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=1200&auto=format&fit=crop",
    schedule: "Daily · 6 AM & 6 PM",
  },
  {
    icon: Bike,
    name: "Aerobics",
    desc: "Group aerobic classes to build stamina with great music.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop",
    schedule: "Mon, Wed, Fri · 6 PM",
  },
];

export const metadata = { title: "Classes — Xtreme Fitness" };

export default function ClassesPage() {
  return (
    <>
      <PageHero
        title="Classes"
        subtitle="From raw strength to flowing yoga — a class for every goal."
        image="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1800&auto=format&fit=crop"
      />

      <section className="bg-white py-20">
        <div className="section">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((c, i) => (
              <Reveal key={c.name} delay={i * 70}>
                <div className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-56 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.image}
                      alt={c.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute left-4 top-4 inline-flex rounded-xl bg-white/95 p-2 text-brand shadow">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold">{c.name}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-ink-700">{c.desc}</p>
                    <div className="mt-3 text-xs font-semibold uppercase tracking-widest text-brand">
                      {c.schedule}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
