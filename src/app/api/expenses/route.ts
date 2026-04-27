import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "../_helpers";

export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const b = await req.json();
  const e = await prisma.expense.create({
    data: {
      title: b.title,
      category: b.category || "OTHER",
      amount: Number(b.amount),
      note: b.note || null,
    },
  });
  return NextResponse.json(e);
}
