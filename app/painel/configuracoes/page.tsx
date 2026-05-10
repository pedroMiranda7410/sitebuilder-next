import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ConfiguracoesClient } from "@/components/painel/configuracoes-client";
import { redirect } from "next/navigation";

export default async function ConfiguracoesPage() {
  const session = await auth();
  if (!session || session.user.role !== "client") redirect("/login");

  const tenantId = session.user.tenantId;
  const tenant = tenantId ? await prisma.tenant.findUnique({ where: { id: tenantId } }) : null;

  if (!tenant || !tenantId) {
    return (
      <div className="py-16 text-center text-sm text-neutral-400">
        Tenant não encontrado.
      </div>
    );
  }

  return (
    <ConfiguracoesClient
      tenantId={tenantId}
      initialPrimaryColor={tenant.themePrimaryColor}
      initialSecondaryColor={tenant.themeSecondaryColor}
      initialFont={tenant.themeFont}
      initialDomain={tenant.domain}
      tenantName={tenant.name}
      tenantSlug={tenant.slug}
      userEmail={session.user.email ?? ""}
      userId={session.user.id}
    />
  );
}
