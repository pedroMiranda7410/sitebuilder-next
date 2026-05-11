import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { corsHeaders, corsOptions } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const tenant = await prisma.tenant.findFirst({
    where: { slug: params.slug, active: true },
    include: {
      sections: {
        orderBy: { position: "asc" },
        include: { fields: { orderBy: { position: "asc" } } },
      },
      events: {
        where: {
          registrationOpen: true,
          OR: [{ eventDate: null }, { eventDate: { gte: new Date() } }],
        },
        orderBy: { eventDate: "asc" },
      },
      services: {
        where: { visible: true },
        orderBy: { position: "asc" },
        include: { fields: { orderBy: { position: "asc" } } },
      },
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
  }

  return NextResponse.json(
    {
      tenant: {
        slug: tenant.slug,
        name: tenant.name,
        theme_primary_color: tenant.themePrimaryColor,
        theme_secondary_color: tenant.themeSecondaryColor,
        theme_font: tenant.themeFont,
        logo_url: tenant.logoUrl,
        domain: tenant.domain,
        languages: tenant.languages,
        default_lang: tenant.defaultLang,
      },
      sections: tenant.sections.map((s) => ({
        id: s.id,
        section_key: s.sectionKey,
        section_type: s.sectionType,
        label: s.label,
        position: s.position,
        visible: s.visible,
        fields: s.fields.map((f) => ({
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
        content: s.content,
      })),
      events: tenant.events.map((e) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        description: e.description,
        event_date: e.eventDate,
        location: e.location,
        cover_image_url: e.coverImageUrl,
        registration_open: e.registrationOpen,
      })),
      services: tenant.services.map((s) => ({
        id: s.id,
        slug: s.slug,
        position: s.position,
        cover_image_url: s.coverImageUrl,
        fields: s.fields.map((f) => ({
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
        content: s.content,
      })),
    },
    { headers: corsHeaders }
  );
}

export function OPTIONS() {
  return corsOptions();
}
