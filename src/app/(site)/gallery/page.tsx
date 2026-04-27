import { prisma } from "@/lib/prisma";

export const metadata = { title: "Gallery — Xtreme Fitness" };
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({
    where: { deletedAt: null, active: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const categories = Array.from(new Set(images.map((i) => i.category)));

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex h-[50vh] items-center justify-center bg-cover bg-center bg-fixed text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(11,11,13,0.7),rgba(11,11,13,0.7)), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1800&auto=format&fit=crop)",
        }}
      >
        <div className="section text-center">
          <h1 className="font-display text-5xl font-extrabold md:text-6xl">Gallery</h1>
          <p className="mt-3 text-white/80">A look inside Xtreme Fitness Gym, Sector 115 Mohali.</p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="section">
          {categories.map((cat) => (
            <div key={cat} className="mb-12">
              <h2 className="mb-6 font-display text-2xl font-extrabold">
                <span className="text-brand">#</span>{cat}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {images
                  .filter((i) => i.category === cat)
                  .map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square overflow-hidden rounded-xl shadow-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                      <div className="absolute bottom-3 left-3 right-3 translate-y-4 text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                        <div className="text-sm font-semibold">{img.title}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="py-20 text-center text-ink-700">
              Gallery is being updated. Check back soon!
            </div>
          )}
        </div>
      </section>
    </>
  );
}
