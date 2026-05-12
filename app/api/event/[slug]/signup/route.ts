import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { eventSignupSchema, type FormField } from "@/lib/validations";
import { corsHeaders, corsOptions } from "@/lib/api-helpers";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const event = await prisma.siteEvent.findFirst({
    where: { slug: params.slug, registrationOpen: true },
  });
  if (!event) {
    return NextResponse.json(
      { success: false, error: "Evento não encontrado ou inscrições fechadas" },
      { status: 404, headers: corsHeaders }
    );
  }

  if (!event.collectSignups) {
    return NextResponse.json(
      { success: false, error: "Este evento não coleta inscrições" },
      { status: 400, headers: corsHeaders }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, errors: ["JSON inválido"] },
      { status: 422, headers: corsHeaders }
    );
  }

  const parsed = eventSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, errors: parsed.error.issues.map((i) => i.message) },
      { status: 422, headers: corsHeaders }
    );
  }

  const { responses } = parsed.data;

  // Validate required fields from formSchema
  const schema = event.formSchema as FormField[];
  const validationErrors: string[] = [];
  for (const field of schema) {
    if (field.type === "heading" || field.type === "paragraph") continue;
    if (field.required) {
      const value = responses[field.id];
      const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);
      if (isEmpty) {
        const label =
          typeof field.label === "object"
            ? (field.label as Record<string, string>).pt ??
              (field.label as Record<string, string>).en ??
              field.id
            : String(field.label);
        validationErrors.push(`Campo obrigatório: ${label}`);
      }
    }
  }

  if (validationErrors.length > 0) {
    return NextResponse.json(
      { success: false, errors: validationErrors },
      { status: 422, headers: corsHeaders }
    );
  }

  // Extract name/email/phone from responses for convenience fields
  const emailFieldId = schema.find((f) => f.type === "email")?.id;
  const phoneFieldId = schema.find((f) => f.type === "phone")?.id;
  const textFields = schema.filter((f) => f.type === "text");
  const nameFieldId = textFields[0]?.id;

  const email = emailFieldId ? String(responses[emailFieldId] ?? "") : null;
  const name = nameFieldId ? String(responses[nameFieldId] ?? "") : null;
  const phone = phoneFieldId ? String(responses[phoneFieldId] ?? "") : null;

  await prisma.eventSignup.create({
    data: {
      eventId: event.id,
      name: name || null,
      email: email || null,
      phone: phone || null,
      responses: responses as object,
    },
  });

  return NextResponse.json({ success: true }, { status: 201, headers: corsHeaders });
}

export function OPTIONS() {
  return corsOptions();
}
