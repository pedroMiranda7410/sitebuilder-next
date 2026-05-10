import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireClient } from "@/lib/api-helpers";

export async function GET() {
  const { session, error } = await requireClient();
  if (error) return error;

  const tenantId = session!.user.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant não configurado" }, { status: 400 });
  }

  const sections = await prisma.section.findMany({
    where: { tenantId },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(sections);
}
