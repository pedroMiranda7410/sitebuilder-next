import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { corsHeaders, corsOptions } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string; serviceSlug: string } }
) {
  const tenant = await prisma.tenant.findFirst({
    where: { slug: params.slug, active: true },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
  }

  const service = await prisma.servicePage.findFirst({
    where: { tenantId: tenant.id, slug: params.serviceSlug, visible: true },
    include: { fields: { orderBy: { position: "asc" } } },
  });

  if (!service) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
  }

  return NextResponse.json(
    {
      id: service.id,
      slug: service.slug,
      position: service.position,
      cover_image_url: service.coverImageUrl,
      fields: service.fields.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        translatable: f.translatable,
        position: f.position,
        placeholder: f.placeholder,
        help_text: f.helpText,
        required: f.required,
        options: f.options,
      })),
      content: service.content,
    },
    { headers: corsHeaders }
  );
}

export function OPTIONS() {
  return corsOptions();
}
