import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { EditTenantForm } from "@/components/admin/edit-tenant-form";

export default async function EditTenantPage({
  params,
}: {
  params: { id: string };
}) {
  const tenant = await prisma.tenant.findUnique({ where: { id: params.id } });
  if (!tenant) notFound();

  return (
    <div>
      <Link
        href={`/admin/tenants/${tenant.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-5"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        {tenant.name}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Editar {tenant.name}</h1>
        <p className="text-sm text-neutral-500 mt-1">Altere os dados e a identidade visual do cliente.</p>
      </div>

      <EditTenantForm
        tenantId={tenant.id}
        initialName={tenant.name}
        initialSlug={tenant.slug}
        initialDomain={tenant.domain}
        initialPrimaryColor={tenant.themePrimaryColor}
        initialSecondaryColor={tenant.themeSecondaryColor}
        initialFont={tenant.themeFont}
        initialLogoUrl={tenant.logoUrl}
        initialActive={tenant.active}
      />
    </div>
  );
}
