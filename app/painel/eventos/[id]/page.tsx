import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SignupsTable } from "@/components/painel/signups-table";
import type { FormField } from "@/components/painel/eventos-client";

export default async function EventoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await prisma.siteEvent.findUnique({
    where: { id: params.id },
    include: { signups: { orderBy: { createdAt: "asc" } } },
  });
  if (!event) notFound();

  const formSchema = (event.formSchema ?? []) as unknown as FormField[];

  const signups = event.signups.map((s) => ({
    id: s.id,
    name: s.name ?? null,
    email: s.email ?? null,
    phone: s.phone ?? null,
    responses: (s.responses ?? {}) as Record<string, unknown>,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div>
      <Link
        href="/painel/eventos"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-5"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Eventos
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">{event.title}</h1>
          <p className="text-sm text-neutral-500">
            {signups.length} inscri{signups.length !== 1 ? "ções" : "ção"}
          </p>
        </div>
      </div>

      <SignupsTable formSchema={formSchema} signups={signups} eventTitle={event.title} />
    </div>
  );
}
