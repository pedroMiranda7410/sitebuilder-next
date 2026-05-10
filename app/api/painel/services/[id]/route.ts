import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireClient } from "@/lib/api-helpers";
import { servicePageSchema } from "@/lib/validations";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireClient();
  if (error) return error;

  const tenantId = session!.user.tenantId;

  const service = await prisma.servicePage.findFirst({
    where: { id: params.id, tenantId: tenantId ?? undefined },
  });

  if (!service) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
  return NextResponse.json(service);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireClient();
  if (error) return error;

  const tenantId = session!.user.tenantId;

  const service = await prisma.servicePage.findFirst({
    where: { id: params.id, tenantId: tenantId ?? undefined },
  });
  if (!service) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 422 });
  }

  const parsed = servicePageSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((i) => i.message) },
      { status: 422 }
    );
  }

  const { content, ...rest } = parsed.data;

  const updated = await prisma.servicePage.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(content !== undefined ? { content: content as object } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireClient();
  if (error) return error;

  const tenantId = session!.user.tenantId;

  const service = await prisma.servicePage.findFirst({
    where: { id: params.id, tenantId: tenantId ?? undefined },
  });
  if (!service) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });

  await prisma.servicePage.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
