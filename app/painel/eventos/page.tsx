import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { EventosClient } from "@/components/painel/eventos-client";

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
    ...e,
    eventDate: e.eventDate ? e.eventDate.toISOString() : null,
  }));

  return <EventosClient events={serialized} />;
}
