import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-helpers";
import { z } from "zod";

const reorderSchema = z.object({
  fields: z.array(z.object({ id: z.string(), position: z.number().int() })).min(1),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 422 });
  }

  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((i) => i.message) },
      { status: 422 }
    );
  }

  await prisma.$transaction(
    parsed.data.fields.map(({ id, position }) =>
      prisma.sectionField.updateMany({
        where: { id, sectionId: params.id },
        data: { position },
      })
    )
  );

  return NextResponse.json({ success: true });
}
