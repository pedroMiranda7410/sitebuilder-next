import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireClient } from "@/lib/api-helpers";
import { sectionContentSchema } from "@/lib/validations";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireClient();
  if (error) return error;

  const tenantId = session!.user.tenantId;

  const section = await prisma.section.findFirst({
    where: { id: params.id, tenantId: tenantId ?? undefined },
  });
  if (!section) {
    return NextResponse.json({ error: "Seção não encontrada" }, { status: 404 });
  }

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

  const updated = await prisma.section.update({
    where: { id: params.id },
    data: {
      content: parsed.data.content as object,
      visible: parsed.data.visible ?? section.visible,
      label: parsed.data.label ?? section.label,
      position: parsed.data.position ?? section.position,
    },
  });

  return NextResponse.json(updated);
}
