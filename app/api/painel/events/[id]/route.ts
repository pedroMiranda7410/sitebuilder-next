import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireClient } from "@/lib/api-helpers";
import { eventSchema } from "@/lib/validations";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireClient();
  if (error) return error;

  const tenantId = session!.user.tenantId;

  const event = await prisma.siteEvent.findFirst({
    where: { id: params.id, tenantId: tenantId ?? undefined },
    include: { signups: { orderBy: { createdAt: "desc" } } },
  });

  if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireClient();
  if (error) return error;

  const tenantId = session!.user.tenantId;

  const event = await prisma.siteEvent.findFirst({
    where: { id: params.id, tenantId: tenantId ?? undefined },
  });
  if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 422 });
  }

  const parsed = eventSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((i) => i.message) },
      { status: 422 }
    );
  }

  const { eventDate, formSchema, ...rest } = parsed.data;

  const updated = await prisma.siteEvent.update({
    where: { id: params.id },
    data: {
      ...rest,
      eventDate: eventDate !== undefined ? (eventDate ? new Date(eventDate) : null) : undefined,
      ...(formSchema !== undefined ? { formSchema: formSchema as object[] } : {}),
    },
  });

  return NextResponse.json(updated);
}
