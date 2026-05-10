import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-helpers";
import { sectionContentSchema } from "@/lib/validations";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const section = await prisma.section.findUnique({ where: { id: params.id } });
  if (!section) return NextResponse.json({ error: "Seção não encontrada" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 422 });
  }

  const parsed = sectionContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((i) => i.message) },
      { status: 422 }
    );
  }

  const { content, visible, label, position } = parsed.data;

  const updated = await prisma.section.update({
    where: { id: params.id },
    data: {
      content: content as object,
      ...(visible !== undefined ? { visible } : {}),
      ...(label !== undefined ? { label } : {}),
      ...(position !== undefined ? { position } : {}),
    },
  });

  return NextResponse.json(updated);
}
