import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-helpers";
import { importSchema } from "@/lib/validations";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 422 });
  }

  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) },
      { status: 422 }
    );
  }

  const data = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Tenant — idempotent upsert on slug
      const t = data.tenant;
      const tenant = await tx.tenant.upsert({
        where: { slug: t.slug },
        update: {
          name: t.name,
          themePrimaryColor: t.themePrimaryColor ?? "#000000",
          themeSecondaryColor: t.themeSecondaryColor ?? "#ffffff",
          themeFont: t.themeFont ?? "Inter",
          logoUrl: t.logoUrl ?? null,
          domain: t.domain ?? null,
          active: true,
          ...(t.languages ? { languages: t.languages } : {}),
          ...(t.default_lang ? { defaultLang: t.default_lang } : {}),
        },
        create: {
          slug: t.slug,
          name: t.name,
          themePrimaryColor: t.themePrimaryColor ?? "#000000",
          themeSecondaryColor: t.themeSecondaryColor ?? "#ffffff",
          themeFont: t.themeFont ?? "Inter",
          logoUrl: t.logoUrl ?? null,
          domain: t.domain ?? null,
          active: true,
          ...(t.languages ? { languages: t.languages } : {}),
          ...(t.default_lang ? { defaultLang: t.default_lang } : {}),
        },
      });

      // User — idempotent on email
      if (data.user) {
        const u = data.user;
        const passwordHash = await hash(u.password, 12);
        const existing = await tx.user.findUnique({ where: { email: u.email } });
        if (!existing) {
          await tx.user.create({
            data: {
              name: u.name ?? tenant.name,
              email: u.email,
              password: passwordHash,
              role: "client",
              tenantId: tenant.id,
            },
          });
        }
      }

      // Sections — idempotent on (tenantId, sectionKey)
      for (let idx = 0; idx < data.sections.length; idx++) {
        const s = data.sections[idx];
        const section = await tx.section.upsert({
          where: { tenantId_sectionKey: { tenantId: tenant.id, sectionKey: s.section_key } },
          update: {
            sectionType: s.section_type,
            label: s.label ?? s.section_key,
            position: s.position ?? idx + 1,
            visible: s.visible ?? true,
            content: (s.content ?? {}) as object,
          },
          create: {
            tenantId: tenant.id,
            sectionKey: s.section_key,
            sectionType: s.section_type,
            label: s.label ?? s.section_key,
            position: s.position ?? idx + 1,
            visible: s.visible ?? true,
            content: (s.content ?? {}) as object,
          },
        });

        // Fields — idempotent on (sectionId, key), never delete existing
        for (let fidx = 0; fidx < (s.fields ?? []).length; fidx++) {
          const f = s.fields![fidx];
          await tx.sectionField.upsert({
            where: { sectionId_key: { sectionId: section.id, key: f.key } },
            update: {
              label: f.label,
              type: f.type,
              translatable: f.translatable ?? true,
              placeholder: f.placeholder ?? null,
              helpText: f.help_text ?? null,
              required: f.required ?? false,
              position: f.position ?? fidx + 1,
              options: f.options != null ? (f.options as Prisma.InputJsonValue) : Prisma.JsonNull,
            },
            create: {
              sectionId: section.id,
              key: f.key,
              label: f.label,
              type: f.type,
              translatable: f.translatable ?? true,
              placeholder: f.placeholder ?? null,
              helpText: f.help_text ?? null,
              required: f.required ?? false,
              position: f.position ?? fidx + 1,
              options: f.options != null ? (f.options as Prisma.InputJsonValue) : Prisma.JsonNull,
            },
          });
        }
      }

      // Events — idempotent on (tenantId, slug)
      for (const e of data.events ?? []) {
        await tx.siteEvent.upsert({
          where: { tenantId_slug: { tenantId: tenant.id, slug: e.slug } },
          update: {
            title: e.title,
            description: e.description ?? null,
            eventDate: e.event_date ? new Date(e.event_date) : null,
            location: e.location ?? null,
            coverImageUrl: e.cover_image_url ?? null,
            registrationOpen: e.registration_open ?? false,
          },
          create: {
            tenantId: tenant.id,
            slug: e.slug,
            title: e.title,
            description: e.description ?? null,
            eventDate: e.event_date ? new Date(e.event_date) : null,
            location: e.location ?? null,
            coverImageUrl: e.cover_image_url ?? null,
            registrationOpen: e.registration_open ?? false,
          },
        });
      }

      // Newsletter subscribers
      for (const s of data.newsletter_subscribers ?? []) {
        await tx.newsletterSubscriber.upsert({
          where: { tenantId_email: { tenantId: tenant.id, email: s.email } },
          update: { active: true, name: s.name ?? undefined },
          create: { tenantId: tenant.id, email: s.email, name: s.name, active: true },
        });
      }

      // Services — idempotent on (tenantId, slug)
      for (let idx = 0; idx < (data.services ?? []).length; idx++) {
        const s = data.services![idx];
        const service = await tx.servicePage.upsert({
          where: { tenantId_slug: { tenantId: tenant.id, slug: s.slug } },
          update: {
            position: s.position ?? idx + 1,
            visible: s.visible ?? true,
            coverImageUrl: s.cover_image_url ?? null,
            content: (s.content ?? {}) as object,
          },
          create: {
            tenantId: tenant.id,
            slug: s.slug,
            position: s.position ?? idx + 1,
            visible: s.visible ?? true,
            coverImageUrl: s.cover_image_url ?? null,
            content: (s.content ?? {}) as object,
          },
        });

        // Fields — idempotent on (serviceId, key), never delete existing
        for (let fidx = 0; fidx < (s.fields ?? []).length; fidx++) {
          const f = s.fields![fidx];
          await tx.serviceField.upsert({
            where: { serviceId_key: { serviceId: service.id, key: f.key } },
            update: {
              label: f.label,
              type: f.type,
              translatable: f.translatable ?? true,
              placeholder: f.placeholder ?? null,
              helpText: f.help_text ?? null,
              required: f.required ?? false,
              position: f.position ?? fidx + 1,
              options: f.options != null ? (f.options as Prisma.InputJsonValue) : Prisma.JsonNull,
            },
            create: {
              serviceId: service.id,
              key: f.key,
              label: f.label,
              type: f.type,
              translatable: f.translatable ?? true,
              placeholder: f.placeholder ?? null,
              helpText: f.help_text ?? null,
              required: f.required ?? false,
              position: f.position ?? fidx + 1,
              options: f.options != null ? (f.options as Prisma.InputJsonValue) : Prisma.JsonNull,
            },
          });
        }
      }

      return tenant;
    });

    return NextResponse.json(
      { success: true, tenantId: result.id, slug: result.slug },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
