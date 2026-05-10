import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ExternalLink } from "lucide-react";
import { SectionCards } from "@/components/painel/section-cards";

export default async function PainelPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  const [sections, tenant] = await Promise.all([
    tenantId
      ? prisma.section.findMany({
          where: { tenantId },
          orderBy: { position: "asc" },
        })
      : [],
    tenantId ? prisma.tenant.findUnique({ where: { id: tenantId } }) : null,
  ]);

  const sectionsWithContent = sections.map((s) => ({
    ...s,
    content: (s.content ?? {}) as Record<string, unknown>,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
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
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors"
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
        />
      )}
    </div>
  );
}
