import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-helpers";
import { tenantSchema } from "@/lib/validations";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const tenant = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: {
      sections: { orderBy: { position: "asc" } },
      events: { orderBy: { eventDate: "asc" } },
      services: { orderBy: { position: "asc" } },
      users: { where: { role: "client" }, select: { id: true, name: true, email: true } },
      _count: { select: { subscribers: true } },
    },
  });

  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tenant);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 422 });
  }

  const parsed = tenantSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((i) => i.message) },
      { status: 422 }
    );
  }

  try {
    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json(tenant);
  } catch {
    return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await prisma.tenant.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
  }
}
