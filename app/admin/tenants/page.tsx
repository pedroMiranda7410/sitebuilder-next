import prisma from "@/lib/prisma";
import Link from "next/link";
import { Upload } from "lucide-react";
import { TenantsTable } from "@/components/admin/tenants-table";

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({
    include: { _count: { select: { sections: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Clientes</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {tenants.length} cliente{tenants.length !== 1 ? "s" : ""} cadastrado
            {tenants.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/import"
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-neutral-300 text-neutral-800 text-sm font-medium rounded-lg hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Importar JSON
          </Link>
          <Link
            href="/admin/tenants/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            + Novo cliente
          </Link>
        </div>
      </div>

      <TenantsTable tenants={tenants} />
    </div>
  );
}
