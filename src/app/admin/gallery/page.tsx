import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/PageHeader";
import GalleryForm from "./gallery-form";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function GalleryAdminPage() {
  const images = await prisma.galleryImage.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return (
    <div>
      <PageHeader title="Gallery" subtitle={`${images.length} images · shown on the public Gallery page`} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((img) => (
            <div key={img.id} className="group card overflow-hidden">
              <div className="relative h-40 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">{img.category}</span>
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="truncate text-sm font-medium">{img.title}</div>
                <DeleteButton endpoint={`/api/gallery/${img.id}`} iconOnly confirm={`Delete "${img.title}"?`} />
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-full card p-8 text-center text-ink-700">
              No gallery images yet. Add one →
            </div>
          )}
        </div>
        <div className="card h-fit p-5">
          <h3 className="mb-3 font-semibold">Add Image</h3>
          <GalleryForm />
        </div>
      </div>
    </div>
  );
}
