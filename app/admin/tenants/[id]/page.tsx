import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, Pencil } from "lucide-react";
import { TenantTabs } from "@/components/admin/tenant-tabs";

export default async function TenantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: {
      sections: {
        orderBy: { position: "asc" },
        include: { fields: { orderBy: { position: "asc" } } },
      },
      events: {
        orderBy: { eventDate: "asc" },
        include: { _count: { select: { signups: true } } },
      },
      users: { where: { role: "client" } },
      services: { orderBy: { position: "asc" } },
      _count: { select: { subscribers: true } },
    },
  });

  if (!tenant) notFound();

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href="/admin/tenants"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-5"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Clientes
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: tenant.themePrimaryColor }}
          >
            {tenant.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{tenant.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                /{tenant.slug}
              </code>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  tenant.active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-neutral-100 text-neutral-500"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${tenant.active ? "bg-emerald-500" : "bg-neutral-400"}`}
                />
                {tenant.active ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/site/${tenant.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-neutral-300 text-neutral-800 text-sm font-medium rounded-lg hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver API
          </a>
          <Link
            href={`/admin/tenants/${tenant.id}/edit`}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </Link>
        </div>
      </div>

      {/* Info bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Seções", value: tenant.sections.length },
          { label: "Serviços", value: tenant.services.length },
          { label: "Eventos", value: tenant.events.length },
          { label: "Inscritos", value: tenant._count.subscribers },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-neutral-200 px-4 py-3">
            <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
            <p className="text-xl font-bold text-neutral-900 tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Theme info */}
      <div className="bg-white rounded-xl border border-neutral-200 px-5 py-4 mb-6">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
          Identidade visual
        </p>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md border border-black/10 flex-shrink-0"
              style={{ backgroundColor: tenant.themePrimaryColor }}
            />
            <span className="text-sm text-neutral-600">
              Primária{" "}
              <code className="text-xs text-neutral-400">{tenant.themePrimaryColor}</code>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md border border-black/10 flex-shrink-0"
              style={{ backgroundColor: tenant.themeSecondaryColor }}
            />
            <span className="text-sm text-neutral-600">
              Secundária{" "}
              <code className="text-xs text-neutral-400">{tenant.themeSecondaryColor}</code>
            </span>
          </div>
          <div className="text-sm text-neutral-600">
            Fonte: <span className="font-medium text-neutral-900">{tenant.themeFont}</span>
          </div>
          {tenant.domain && (
            <div className="text-sm text-neutral-600">
              Domínio: <span className="font-medium text-neutral-900">{tenant.domain}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <TenantTabs
        tenantId={tenant.id}
        sections={tenant.sections.map((s) => ({
          ...s,
          fields: s.fields.map((f) => ({ ...f, options: f.options as Record<string, unknown> | null })),
        }))}
        events={tenant.events.map((e) => ({
          ...e,
          eventDate: e.eventDate ? e.eventDate.toISOString() : null,
        }))}
        users={tenant.users.map((u) => ({ ...u, email: u.email ?? "" }))}
        services={tenant.services.map((s) => ({
          id: s.id,
          slug: s.slug,
          position: s.position,
          visible: s.visible,
          hasDetailPage: s.hasDetailPage,
          cardContent: s.cardContent as Record<string, unknown>,
        }))}
      />
    </div>
  );
}
