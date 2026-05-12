import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ServiceList } from "@/components/painel/service-list";

export default async function ServicosPage() {
  const session = await auth();
  if (!session || session.user.role !== "client") redirect("/login");

  const tenantId = session.user.tenantId;
  if (!tenantId) redirect("/painel");

  const [services, tenant] = await Promise.all([
    prisma.servicePage.findMany({
      where: { tenantId },
      orderBy: { position: "asc" },
    }),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
  ]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Serviços</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gerencie os serviços exibidos no seu site.
          </p>
        </div>
        <Link
          href="/painel/servicos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo serviço
        </Link>
      </div>

      <ServiceList
        initialServices={services.map((s) => ({
          id: s.id,
          slug: s.slug,
          position: s.position,
          visible: s.visible,
          hasDetailPage: s.hasDetailPage,
          cardContent: s.cardContent as Record<string, unknown>,
        }))}
        tenantPrimaryColor={tenant?.themePrimaryColor ?? "#000000"}
      />
    </div>
  );
}
