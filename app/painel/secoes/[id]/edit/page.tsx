import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SectionEditor } from "@/components/painel/section-editor";

export default async function EditSecaoPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session || session.user.role !== "client") redirect("/login");

  const section = await prisma.section.findFirst({
    where: { id: params.id, tenantId: session.user.tenantId ?? undefined },
  });
  if (!section) notFound();

  const tenant = session.user.tenantId
    ? await prisma.tenant.findUnique({ where: { id: session.user.tenantId } })
    : null;

  return (
    <div>
      <Link
        href="/painel"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-5"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Meu Site
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">{section.label}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          As alterações são salvas automaticamente enquanto você edita.
        </p>
      </div>

      <SectionEditor
        sectionId={section.id}
        sectionType={section.sectionType}
        label={section.label}
        initialContent={(section.content ?? {}) as Record<string, unknown>}
        tenantPrimaryColor={tenant?.themePrimaryColor ?? "#000000"}
        tenantSecondaryColor={tenant?.themeSecondaryColor ?? "#ffffff"}
        tenantFont={tenant?.themeFont ?? "Inter"}
      />
    </div>
  );
}
