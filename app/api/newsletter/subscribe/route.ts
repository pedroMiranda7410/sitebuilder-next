import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations";
import { corsHeaders, corsOptions } from "@/lib/api-helpers";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, errors: ["JSON inválido"] },
      { status: 422, headers: corsHeaders }
    );
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, errors: parsed.error.issues.map((i) => i.message) },
      { status: 422, headers: corsHeaders }
    );
  }

  const { tenant_slug, email, name } = parsed.data;

  const tenant = await prisma.tenant.findFirst({
    where: { slug: tenant_slug, active: true },
  });
  if (!tenant) {
    return NextResponse.json(
      { error: "Tenant não encontrado" },
      { status: 404, headers: corsHeaders }
    );
  }

  await prisma.newsletterSubscriber.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email } },
    update: { active: true, name: name ?? undefined },
    create: { tenantId: tenant.id, email, name, active: true },
  });

  return NextResponse.json({ success: true }, { status: 201, headers: corsHeaders });
}

export function OPTIONS() {
  return corsOptions();
}
