import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-helpers";
import { z } from "zod";

const fieldSchema = z.object({
  key: z
    .string()
    .min(1, "Key obrigatória")
    .regex(/^[a-z][a-z0-9_]*$/, "Key deve ser snake_case"),
  label: z.string().min(1, "Label obrigatória"),
  type: z.string().min(1, "Tipo obrigatório"),
  translatable: z.boolean().default(true),
  placeholder: z.string().optional().nullable(),
  helpText: z.string().optional().nullable(),
  required: z.boolean().default(false),
  position: z.number().int().default(0),
  options: z.record(z.string(), z.unknown()).optional().nullable(),
});

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const service = await prisma.servicePage.findUnique({ where: { id: params.id } });
  if (!service) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });

  const fields = await prisma.serviceField.findMany({
    where: { serviceId: params.id },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(fields);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const service = await prisma.servicePage.findUnique({ where: { id: params.id } });
  if (!service) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 422 });
  }

  const parsed = fieldSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((i) => i.message) },
      { status: 422 }
    );
  }

  const existing = await prisma.serviceField.findUnique({
    where: { serviceId_key: { serviceId: params.id, key: parsed.data.key } },
  });
  if (existing) {
    return NextResponse.json({ error: "Já existe um campo com essa key neste serviço" }, { status: 422 });
  }

  const field = await prisma.serviceField.create({
    data: {
      serviceId: params.id,
      key: parsed.data.key,
      label: parsed.data.label,
      type: parsed.data.type,
      translatable: parsed.data.translatable,
      placeholder: parsed.data.placeholder ?? null,
      helpText: parsed.data.helpText ?? null,
      required: parsed.data.required,
      position: parsed.data.position,
      options: parsed.data.options != null ? (parsed.data.options as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });

  return NextResponse.json(field, { status: 201 });
}
