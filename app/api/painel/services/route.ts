import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireClient } from "@/lib/api-helpers";
import { servicePageSchema } from "@/lib/validations";

export async function GET() {
  const { session, error } = await requireClient();
  if (error) return error;

  const tenantId = session!.user.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant não configurado" }, { status: 400 });
  }

  const services = await prisma.servicePage.findMany({
    where: { tenantId },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(services);
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

  const parsed = servicePageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((i) => i.message) },
      { status: 422 }
    );
  }

  const { slug, position, visible, hasDetailPage, cardContent, detailContent } = parsed.data;

  const existing = await prisma.servicePage.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
  });
  if (existing) {
    return NextResponse.json({ error: "Slug já em uso neste tenant" }, { status: 422 });
  }

  const service = await prisma.servicePage.create({
    data: {
      tenantId,
      slug,
      position,
      visible,
      hasDetailPage,
      cardContent: cardContent as object,
      detailContent: detailContent as object,
    },
  });

  return NextResponse.json(service, { status: 201 });
}
