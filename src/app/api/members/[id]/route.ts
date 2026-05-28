import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRoleFromSession, isSuperAdmin, requireAuth } from "../../_helpers";
import { isManager } from "@/lib/roles";

function memberPatchFromBody(body: Record<string, unknown>): Prisma.MemberUpdateInput {
  const data: Prisma.MemberUpdateInput = {};

  if (typeof body.firstName === "string") data.firstName = body.firstName.trim();
  if (typeof body.lastName === "string") data.lastName = body.lastName.trim();
  if (typeof body.phone === "string") data.phone = body.phone.trim();

  if ("email" in body) {
    const v = body.email;
    data.email = typeof v === "string" && v.trim() !== "" ? v.trim() : null;
  }

  if ("gender" in body) {
    const v = body.gender;
    if (v === "" || v == null) data.gender = null;
    else if (typeof v === "string" && ["MALE", "FEMALE", "OTHER"].includes(v)) data.gender = v;
  }

  if ("dob" in body) {
    const v = body.dob;
    if (v === "" || v == null) data.dob = null;
    else if (typeof v === "string") data.dob = new Date(v);
  }

  if ("address" in body) {
    const v = body.address;
    data.address = typeof v === "string" && v.trim() !== "" ? v.trim() : null;
  }

  if ("emergencyNo" in body) {
    const v = body.emergencyNo;
    data.emergencyNo = typeof v === "string" && v.trim() !== "" ? v.trim() : null;
  }

  if (typeof body.status === "string" && ["ACTIVE", "INACTIVE"].includes(body.status)) {
    data.status = body.status;
  }

  if ("fingerprintId" in body) {
    const v = body.fingerprintId;
    data.fingerprintId = typeof v === "string" && v.trim() !== "" ? v.trim() : null;
  }

  if ("notes" in body && typeof body.notes === "string") {
    data.notes = body.notes.trim() !== "" ? body.notes.trim() : null;
  }

  return data;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const role = getRoleFromSession(session);
  if (!isSuperAdmin(role) && !isManager(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const data = memberPatchFromBody(body);
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  try {
    const m = await prisma.member.update({ where: { id: params.id }, data });
    return NextResponse.json(m);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const role = getRoleFromSession(session);
  const permanent = req.nextUrl.searchParams.get("permanent") === "1";

  const existing = await prisma.member.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (permanent) {
    if (!isSuperAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!existing.deletedAt) {
      return NextResponse.json(
        { error: "Only soft-deleted members can be permanently removed." },
        { status: 400 }
      );
    }
    await prisma.member.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  }

  if (existing.deletedAt) {
    return NextResponse.json({ error: "Already deleted" }, { status: 400 });
  }

  if (!isSuperAdmin(role) && role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.member.update({
    where: { id: params.id },
    data: { deletedAt: new Date(), status: "INACTIVE" },
  });
  return NextResponse.json({ ok: true });
}
