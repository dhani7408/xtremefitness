import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRoleFromSession, isSuperAdmin, requireAuth } from "../_helpers";

export async function GET() {
  return NextResponse.json(
    await prisma.plan.findMany({ where: { deletedAt: null }, orderBy: { months: "asc" } })
  );
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!isSuperAdmin(getRoleFromSession(session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const b = await req.json();
  const plan = await prisma.plan.create({
    data: {
      name: b.name,
      months: Number(b.months),
      price: Number(b.price),
      active: b.active !== false,
    },
  });
  return NextResponse.json(plan);
}
