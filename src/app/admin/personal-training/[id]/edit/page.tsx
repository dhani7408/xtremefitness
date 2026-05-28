import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getRoleFromSession, isSuperAdmin } from "@/lib/roles";
import EditPTForm from "./EditPTForm";

export const dynamic = "force-dynamic";

export default async function EditPTPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const role = getRoleFromSession(session);
  const superUser = isSuperAdmin(role);

  const ptRecord = await prisma.personalTraining.findUnique({
    where: { id: params.id },
    include: { member: true },
  });

  if (!ptRecord) notFound();

  const trainers = await prisma.teamMember.findMany({
    where: { role: "TRAINER", status: "ACTIVE" },
  });

  const initial = {
    id: ptRecord.id,
    used: ptRecord.used,
    sessions: ptRecord.sessions,
    startDate: ptRecord.startDate.toISOString().slice(0, 10),
    endDate: ptRecord.endDate.toISOString().slice(0, 10),
    amount: ptRecord.amount,
    status: ptRecord.status,
    notes: ptRecord.notes,
    trainerId: ptRecord.trainerId,
  };

  return (
    <div>
      <div className="mb-4 text-sm">
        <Link href={`/admin/personal-training/${ptRecord.id}`} className="text-brand hover:underline">
          ← Back to PT details
        </Link>
      </div>
      <EditPTForm initial={initial} trainers={trainers} superUser={superUser} memberName={`${ptRecord.member.firstName} ${ptRecord.member.lastName}`} />
    </div>
  );
}
