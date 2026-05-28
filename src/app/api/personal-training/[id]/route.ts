import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isSuperAdmin, isManager, getRoleFromSession } from "../../_helpers";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;
  
  const role = getRoleFromSession(session);
  if (!isSuperAdmin(role) && !isManager(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    
    // Only super admins can change the amount or trainer, managers can update sessions/status
    const dataToUpdate: any = {
      used: Number(body.used ?? 0),
      status: body.status,
      notes: body.notes,
    };

    if (body.sessions !== undefined) dataToUpdate.sessions = Number(body.sessions);
    if (body.startDate) dataToUpdate.startDate = new Date(body.startDate);
    if (body.endDate) dataToUpdate.endDate = new Date(body.endDate);
    
    if (isSuperAdmin(role)) {
      if (body.amount !== undefined) dataToUpdate.amount = Number(body.amount);
      if (body.trainerId) dataToUpdate.trainerId = body.trainerId;
    }

    const updated = await prisma.personalTraining.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to update" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;
  
  if (!isSuperAdmin(getRoleFromSession(session))) {
    return NextResponse.json({ error: "Only Super Admin can delete PT records" }, { status: 403 });
  }

  try {
    await prisma.personalTraining.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to delete" }, { status: 400 });
  }
}
