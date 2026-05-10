import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signupSchema } from "@/lib/validations";
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, errors: ["JSON inválido"] },
      { status: 422, headers: corsHeaders }
    );
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, errors: parsed.error.issues.map((i) => i.message) },
      { status: 422, headers: corsHeaders }
    );
  }

  const { name, email, phone } = parsed.data;

  const existing = await prisma.eventSignup.findFirst({
    where: { eventId: event.id, email },
  });
  if (existing) {
    return NextResponse.json(
      { success: false, errors: ["Email já inscrito neste evento"] },
      { status: 422, headers: corsHeaders }
    );
  }

  await prisma.eventSignup.create({
    data: { eventId: event.id, name, email, phone },
  });

  return NextResponse.json({ success: true }, { status: 201, headers: corsHeaders });
}

export function OPTIONS() {
  return corsOptions();
}
