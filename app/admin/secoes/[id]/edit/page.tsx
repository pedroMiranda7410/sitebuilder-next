import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SectionEditor } from "@/components/painel/section-editor";

export default async function AdminEditSecaoPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/login");

  const section = await prisma.section.findUnique({ where: { id: params.id } });
  if (!section) notFound();

  const tenant = await prisma.tenant.findUnique({ where: { id: section.tenantId } });

  return (
    <div>
      <Link
        href={`/admin/tenants/${section.tenantId}`}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-5"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        {tenant?.name ?? "Tenant"}
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
        tenantLanguages={tenant?.languages ?? ["pt"]}
        saveEndpoint={`/api/admin/sections/${section.id}`}
      />
    </div>
  );
}
