import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireClient } from "@/lib/api-helpers";
import { eventSchema } from "@/lib/validations";

export async function GET() {
  const { session, error } = await requireClient();
  if (error) return error;

  const tenantId = session!.user.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant não configurado" }, { status: 400 });
  }

  const events = await prisma.siteEvent.findMany({
    where: { tenantId },
    include: { _count: { select: { signups: true } } },
    orderBy: { eventDate: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const { session, error } = await requireClient();
  if (error) return error;

  const tenantId = session!.user.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant não configurado" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 422 });
  }

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((i) => i.message) },
      { status: 422 }
    );
  }

  const { slug, title, description, eventDate, location, coverImageUrl, registrationOpen } =
    parsed.data;

  const existing = await prisma.siteEvent.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
  });
  if (existing) {
    return NextResponse.json({ error: "Slug já em uso neste tenant" }, { status: 422 });
  }

  const event = await prisma.siteEvent.create({
    data: {
      tenantId,
      slug,
      title,
      description: description ?? null,
      eventDate: eventDate ? new Date(eventDate) : null,
      location: location ?? null,
      coverImageUrl: coverImageUrl ?? null,
      registrationOpen,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
