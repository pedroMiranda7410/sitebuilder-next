import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NewServiceForm } from "@/components/painel/new-service-form";

export default async function NovoServicoPage() {
  const session = await auth();
  if (!session || session.user.role !== "client") redirect("/login");
  if (!session.user.tenantId) redirect("/painel");

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
        <h1 className="text-2xl font-bold text-neutral-900">Novo serviço</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Preencha as informações básicas para criar o serviço.
        </p>
      </div>

      <NewServiceForm />
    </div>
  );
}
