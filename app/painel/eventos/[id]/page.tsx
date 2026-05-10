import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EventoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await prisma.siteEvent.findUnique({
    where: { id: params.id },
    include: { signups: { orderBy: { createdAt: "desc" } } },
  });
  if (!event) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900 mb-2">{event.title}</h1>
      <p className="text-sm text-neutral-500 mb-6">
        {event.signups.length} inscrição{event.signups.length !== 1 ? "ões" : ""}
      </p>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {event.signups.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 text-sm">
            Nenhuma inscrição ainda.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">Nome</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">Telefone</th>
              </tr>
            </thead>
            <tbody>
              {event.signups.map((s) => (
                <tr key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="px-5 py-3">{s.name}</td>
                  <td className="px-5 py-3 text-neutral-600">{s.email}</td>
                  <td className="px-5 py-3 text-neutral-600">{s.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
