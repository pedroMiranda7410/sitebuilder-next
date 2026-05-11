import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
});

export const newsletterSchema = z.object({
  tenant_slug: z.string().min(1, "tenant_slug obrigatório"),
  email: z.string().email("Email inválido"),
  name: z.string().optional(),
});

export const tenantSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug obrigatório")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  name: z.string().min(1, "Nome obrigatório"),
  domain: z.string().optional().nullable(),
  themePrimaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#000000"),
  themeSecondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ffffff"),
  themeFont: z.string().default("Inter"),
  logoUrl: z.string().url().optional().nullable(),
  active: z.boolean().default(true),
  languages: z.array(z.string()).optional(),
  defaultLang: z.string().optional(),
});

export const sectionContentSchema = z.object({
  content: z.record(z.string(), z.unknown()),
  visible: z.boolean().optional(),
  label: z.string().optional(),
  position: z.number().int().optional(),
});

export const eventSchema = z.object({
  slug: z.string().min(1, "Slug obrigatório"),
  title: z.string().min(1, "Título obrigatório"),
  description: z.string().optional().nullable(),
  eventDate: z.string().datetime().optional().nullable(),
  location: z.string().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
  registrationOpen: z.boolean().default(false),
});

export const servicePageSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug obrigatório")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  position: z.number().int().default(0),
  visible: z.boolean().default(true),
  content: z.record(z.string(), z.unknown()).default({}),
});

export const importSchema = z.object({
  tenant: z.object({
    slug: z.string().min(1),
    name: z.string().min(1),
    themePrimaryColor: z.string().optional(),
    themeSecondaryColor: z.string().optional(),
    themeFont: z.string().optional(),
    logoUrl: z.string().optional().nullable(),
    domain: z.string().optional().nullable(),
    languages: z.array(z.string()).optional(),
    default_lang: z.string().optional(),
  }),
  user: z
    .object({
      name: z.string().optional(),
      email: z.string().email(),
      password: z.string().min(6),
    })
    .optional(),
  sections: z.array(
    z.object({
      section_key: z.string().min(1),
      section_type: z.string().min(1),
      label: z.string().optional(),
      position: z.number().int().optional(),
      visible: z.boolean().optional(),
      content: z.record(z.string(), z.unknown()).optional(),
      fields: z.array(
        z.object({
          key: z.string().min(1),
          label: z.string().min(1),
          type: z.string().min(1),
          translatable: z.boolean().optional(),
          placeholder: z.string().optional().nullable(),
          help_text: z.string().optional().nullable(),
          required: z.boolean().optional(),
          position: z.number().int().optional(),
          options: z.record(z.string(), z.unknown()).optional().nullable(),
        })
      ).optional(),
    })
  ),
  events: z
    .array(
      z.object({
        slug: z.string().min(1),
        title: z.string().min(1),
        description: z.string().optional().nullable(),
        event_date: z.string().optional().nullable(),
        location: z.string().optional().nullable(),
        cover_image_url: z.string().optional().nullable(),
        registration_open: z.boolean().optional(),
      })
    )
    .optional(),
  newsletter_subscribers: z
    .array(
      z.object({
        email: z.string().email(),
        name: z.string().optional().nullable(),
      })
    )
    .optional(),
  services: z
    .array(
      z.object({
        slug: z.string().min(1),
        position: z.number().int().optional(),
        visible: z.boolean().optional(),
        cover_image_url: z.string().optional().nullable(),
        content: z.record(z.string(), z.unknown()).optional(),
        fields: z.array(
          z.object({
            key: z.string().min(1),
            label: z.string().min(1),
            type: z.string().min(1),
            translatable: z.boolean().optional(),
            placeholder: z.string().optional().nullable(),
            help_text: z.string().optional().nullable(),
            required: z.boolean().optional(),
            position: z.number().int().optional(),
            options: z.record(z.string(), z.unknown()).optional().nullable(),
          })
        ).optional(),
      })
    )
    .optional(),
});

export type ImportPayload = z.infer<typeof importSchema>;
