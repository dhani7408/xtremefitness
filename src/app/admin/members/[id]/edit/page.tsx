import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getRoleFromSession, isSuperAdmin } from "@/lib/roles";
import EditMemberForm, { type EditMemberInitial } from "./EditMemberForm";

export const dynamic = "force-dynamic";

export default async function EditMemberPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const role = getRoleFromSession(session);
  const superUser = isSuperAdmin(role);

  const member = await prisma.member.findUnique({ where: { id: params.id } });
  if (!member) notFound();
  if (member.deletedAt && !superUser) notFound();

  const initial: EditMemberInitial = {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    phone: member.phone,
    email: member.email,
    gender: member.gender,
    dob: member.dob ? member.dob.toISOString() : null,
    address: member.address,
    emergencyNo: member.emergencyNo,
    status: member.status,
    fingerprintId: member.fingerprintId,
    notes: member.notes,
  };

  return (
    <div>
      <div className="mb-4 text-sm">
        <Link href={`/admin/members/${member.id}`} className="text-brand hover:underline">
          ← Back to profile
        </Link>
      </div>
      <EditMemberForm member={initial} />
    </div>
  );
}
