import { prisma } from "@/lib/prisma";
import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";

export const metadata = { title: "Trainers — Xtreme Fitness" };
export const dynamic = "force-dynamic";

export default async function TrainersPage() {
  const trainers = await prisma.teamMember.findMany({
    where: {
      deletedAt: null,
      status: "ACTIVE",
      role: { in: ["OWNER", "TRAINER", "MANAGER"] },
    },
    orderBy: [{ role: "asc" }, { firstName: "asc" }],
  });

  const owners = trainers.filter((t) => t.role === "OWNER");
  const coaches = trainers.filter((t) => t.role !== "OWNER");

  return (
    <>
      <PageHero
        title="Meet the Team"
        subtitle="Our owners and coaches are what make Xtreme, Xtreme."
        image="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1800&auto=format&fit=crop"
      />

      <section className="bg-white py-20">
        <div className="section">
          {owners.length > 0 && (
            <Reveal>
              <div className="mb-14">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
                  The owners
                </div>
                <h2 className="font-display text-3xl font-extrabold md:text-4xl">
                  Meet the founders of Xtreme Fitness.
                </h2>
                <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                  {owners.map((t) => (
                    <div
                      key={t.id}
                      className="group overflow-hidden rounded-3xl bg-gray-50 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div
                        className="h-80 w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
                        style={{
                          backgroundImage: `url(${
                            t.photoUrl ||
                            "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=900&auto=format&fit=crop"
                          })`,
                        }}
                      />
                      <div className="p-6">
                        <div className="text-xs font-semibold uppercase tracking-widest text-brand">
                          {t.role}
                        </div>
                        <div className="mt-1 text-2xl font-bold">
                          {t.firstName} {t.lastName}
                        </div>
                        {t.bio && <p className="mt-2 text-sm text-ink-700">{t.bio}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          <Reveal>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
              Our coaches
            </div>
            <h2 className="font-display text-3xl font-extrabold md:text-4xl">
              Certified trainers, ready to push you.
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {coaches.map((t, i) => (
              <Reveal key={t.id} delay={i * 60}>
                <div className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
                  <div
                    className="h-60 w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: `url(${
                        t.photoUrl ||
                        "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=600&auto=format&fit=crop"
                      })`,
                    }}
                  />
                  <div className="p-5">
                    <div className="text-xs font-semibold uppercase tracking-widest text-brand">
                      {t.role}
                    </div>
                    <div className="mt-1 text-lg font-bold">
                      {t.firstName} {t.lastName}
                    </div>
                    {t.bio && <p className="mt-2 line-clamp-3 text-sm text-ink-700">{t.bio}</p>}
                  </div>
                </div>
              </Reveal>
            ))}
            {coaches.length === 0 && (
              <div className="col-span-full text-center text-ink-700">
                Team info coming soon.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
