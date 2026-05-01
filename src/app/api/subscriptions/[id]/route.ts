import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "../../_helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  try {
    const b = await req.json();
    const data: any = {};

    if (b.startDate) data.startDate = new Date(b.startDate);
    if (b.endDate) data.endDate = new Date(b.endDate);
    if (b.amount !== undefined) data.amount = parseFloat(b.amount);

    const sub = await prisma.subscription.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(sub);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to update subscription" }, { status: 500 });
  }
}
