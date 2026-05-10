import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireClient } from "@/lib/api-helpers";
import { z } from "zod";

const reorderSchema = z.object({
  ids: z.array(z.string()).min(1),
});

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

  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((i) => i.message) },
      { status: 422 }
    );
  }

  const { ids } = parsed.data;

  await prisma.$transaction(
    ids.map((id, idx) =>
      prisma.servicePage.updateMany({
        where: { id, tenantId },
        data: { position: idx + 1 },
      })
    )
  );

  return NextResponse.json({ success: true });
}
