import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireClient } from "@/lib/api-helpers";
import { z } from "zod";

const settingsSchema = z.object({
  languages: z.array(z.string().min(2).max(5)).min(1).optional(),
  defaultLang: z.string().min(2).max(5).optional(),
});

export async function PATCH(req: Request) {
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

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((i) => i.message) },
      { status: 422 }
    );
  }

  const { languages, defaultLang } = parsed.data;

  // Ensure defaultLang is in languages list
  if (languages && defaultLang && !languages.includes(defaultLang)) {
    return NextResponse.json(
      { error: "Idioma padrão deve estar na lista de idiomas ativos" },
      { status: 422 }
    );
  }

  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      ...(languages !== undefined ? { languages } : {}),
      ...(defaultLang !== undefined ? { defaultLang } : {}),
    },
    select: { languages: true, defaultLang: true },
  });

  return NextResponse.json(tenant);
}
