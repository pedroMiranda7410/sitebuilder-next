import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ServiceEditor } from "@/components/painel/service-editor";

export default async function EditServicoPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session || session.user.role !== "client") redirect("/login");

  const service = await prisma.servicePage.findFirst({
    where: { id: params.id, tenantId: session.user.tenantId ?? undefined },
  });
  if (!service) notFound();

  const tenant = session.user.tenantId
    ? await prisma.tenant.findUnique({ where: { id: session.user.tenantId } })
    : null;

  return (
    <div>
      <Link
        href="/painel/servicos"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-5"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Serviços
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          {(() => {
            const t = service.cardContent as Record<string, unknown>;
            const title = t.title;
            if (typeof title === "string") return title;
            if (title && typeof title === "object") {
              const tl = title as Record<string, string>;
              return tl.pt ?? tl.en ?? service.slug;
            }
            return service.slug;
          })()}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          As alterações são salvas automaticamente enquanto você edita.
        </p>
      </div>

      <ServiceEditor
        serviceId={service.id}
        slug={service.slug}
        initialVisible={service.visible}
        initialHasDetailPage={service.hasDetailPage}
        initialCardContent={(service.cardContent ?? {}) as Record<string, unknown>}
        initialDetailContent={(service.detailContent ?? {}) as Record<string, unknown>}
        tenantLanguages={tenant?.languages ?? ["pt"]}
      />
    </div>
  );
}
