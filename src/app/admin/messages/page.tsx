import { prisma } from "@/lib/prisma";
import { fmtDateTime } from "@/lib/utils";
import PageHeader from "@/components/admin/PageHeader";
import Broadcast from "./broadcast";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const logs = await prisma.messageLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { member: true },
  });
  return (
    <div>
      <PageHeader title="Messages" subtitle="WhatsApp broadcasts & automated notifications" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-ink-700">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Kind</th>
                <th className="p-3">To</th>
                <th className="p-3">Body</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((m) => (
                <tr key={m.id}>
                  <td className="p-3 text-xs">{fmtDateTime(m.createdAt)}</td>
                  <td className="p-3 text-xs">{m.kind}</td>
                  <td className="p-3 text-xs">
                    {m.member ? `${m.member.firstName} ${m.member.lastName}` : m.phone}
                  </td>
                  <td className="p-3 text-xs line-clamp-2 max-w-md">{m.body}</td>
                  <td className="p-3">
                    <span className={`badge ${
                      m.status === "SENT" ? "badge-green" :
                      m.status === "FAILED" ? "badge-red" :
                      m.status === "SIMULATED" ? "badge-blue" : "badge-yellow"
                    }`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-ink-700">No messages sent yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <Broadcast />
      </div>
    </div>
  );
}
