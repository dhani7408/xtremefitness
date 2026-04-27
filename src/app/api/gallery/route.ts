import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "../_helpers";

export async function GET() {
  const images = await prisma.galleryImage.findMany({
    where: { deletedAt: null, active: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(images);
}

export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const b = await req.json();
  if (!b.title || !b.url) {
    return NextResponse.json({ error: "title and url required" }, { status: 400 });
  }
  const img = await prisma.galleryImage.create({
    data: {
      title: b.title,
      url: b.url,
      category: b.category || "GYM",
      order: Number(b.order || 0),
      active: b.active !== false,
    },
  });
  return NextResponse.json(img);
}
