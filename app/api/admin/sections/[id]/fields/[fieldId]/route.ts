import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-helpers";
import { z } from "zod";

const patchSchema = z.object({
  label: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  translatable: z.boolean().optional(),
  placeholder: z.string().optional().nullable(),
  helpText: z.string().optional().nullable(),
  required: z.boolean().optional(),
  position: z.number().int().optional(),
  options: z.record(z.string(), z.unknown()).optional().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; fieldId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const field = await prisma.sectionField.findFirst({
    where: { id: params.fieldId, sectionId: params.id },
  });
  if (!field) return NextResponse.json({ error: "Campo não encontrado" }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 422 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((i) => i.message) },
      { status: 422 }
    );
  }

  const { options, ...rest } = parsed.data;
  const updated = await prisma.sectionField.update({
    where: { id: params.fieldId },
    data: {
      ...rest,
      ...(options !== undefined
        ? { options: options != null ? (options as Prisma.InputJsonValue) : Prisma.JsonNull }
        : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; fieldId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const field = await prisma.sectionField.findFirst({
    where: { id: params.fieldId, sectionId: params.id },
  });
  if (!field) return NextResponse.json({ error: "Campo não encontrado" }, { status: 404 });

  await prisma.sectionField.delete({ where: { id: params.fieldId } });
  return NextResponse.json({ success: true });
}
