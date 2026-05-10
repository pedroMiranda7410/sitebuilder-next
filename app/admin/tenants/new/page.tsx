import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NewTenantForm } from "@/components/admin/new-tenant-form";

export default function NewTenantPage() {
  return (
    <div>
      <Link
        href="/admin/tenants"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-5"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Clientes
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Novo cliente</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Preencha os dados para cadastrar um novo cliente.
        </p>
      </div>
      <NewTenantForm />
    </div>
  );
}
