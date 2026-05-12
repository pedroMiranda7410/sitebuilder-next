import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { EventosClient, type FormField } from "@/components/painel/eventos-client";

export default async function EventosPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  const events = tenantId
    ? await prisma.siteEvent.findMany({
        where: { tenantId },
        include: { _count: { select: { signups: true } } },
        orderBy: { eventDate: "asc" },
      })
    : [];

  const serialized = events.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    description: e.description ?? null,
    eventDate: e.eventDate ? e.eventDate.toISOString() : null,
    location: e.location ?? null,
    coverImageUrl: e.coverImageUrl ?? null,
    registrationOpen: e.registrationOpen,
    collectSignups: e.collectSignups,
    formSchema: (e.formSchema ?? []) as unknown as FormField[],
    _count: e._count,
  }));

  return <EventosClient events={serialized} />;
}
