import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireClient } from "@/lib/api-helpers";
import { compare, hash } from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function PATCH(req: Request) {
  const { session, error } = await requireClient();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 422 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 422 }
    );
  }

  const { email, currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Informe a senha atual para alterar a senha" }, { status: 422 });
    }
    const valid = user.password ? await compare(currentPassword, user.password) : false;
    if (!valid) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 422 });
    }
  }

  const updateData: Record<string, unknown> = {};
  if (email && email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) return NextResponse.json({ error: "Este email já está em uso" }, { status: 422 });
    updateData.email = email;
  }
  if (newPassword) {
    updateData.password = await hash(newPassword, 12);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ success: true });
  }

  await prisma.user.update({ where: { id: user.id }, data: updateData });
  return NextResponse.json({ success: true });
}
