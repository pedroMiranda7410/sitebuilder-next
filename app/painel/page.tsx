import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ExternalLink } from "lucide-react";
import { SectionCards } from "@/components/painel/section-cards";

export default async function PainelPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  const [sections, tenant, services] = await Promise.all([
    tenantId
      ? prisma.section.findMany({
          where: { tenantId },
          orderBy: { position: "asc" },
        })
      : [],
    tenantId ? prisma.tenant.findUnique({ where: { id: tenantId } }) : null,
    tenantId
      ? prisma.servicePage.findMany({
          where: { tenantId },
          orderBy: { position: "asc" },
          select: { id: true, slug: true, cardContent: true, visible: true },
        })
      : [],
  ]);

  const sectionsWithContent = sections.map((s) => ({
    ...s,
    content: (s.content ?? {}) as Record<string, unknown>,
  }));

  const serviceMap = Object.fromEntries(services.map((s) => [s.slug, s]));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Meu Site</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Clique em "Editar" para modificar o conteúdo de cada seção.
          </p>
        </div>
        {tenant && (
          <a
            href={`/api/site/${tenant.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 hover:border-neutral-400 transition-colors self-start sm:self-auto"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver site publicado
          </a>
        )}
      </div>

      {sectionsWithContent.length === 0 ? (
        <div className="text-center py-20 text-neutral-400 text-sm bg-white rounded-2xl border border-neutral-200">
          Nenhuma seção configurada ainda.
        </div>
      ) : (
        <SectionCards
          sections={sectionsWithContent}
          tenantPrimaryColor={tenant?.themePrimaryColor ?? "#000000"}
          serviceMap={serviceMap}
        />
      )}
    </div>
  );
}
