"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ExternalLink, Pencil, Trash2, Upload } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  themePrimaryColor: string;
  active: boolean;
  _count: { sections: number };
}

interface TenantsTableProps {
  tenants: Tenant[];
}

export function TenantsTable({ tenants }: TenantsTableProps) {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const debouncedSearch = useDebounce(search, 300);

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.slug.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Deseja deletar o cliente "${name}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/tenants/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Erro ao deletar");
      } else {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/tenants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 h-8 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400"
          />
        </div>
        <span className="text-xs text-neutral-400 ml-auto">
          {filtered.length} cliente{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="py-14 text-center text-sm text-neutral-400">
          {search ? "Nenhum resultado para essa busca." : "Nenhum cliente cadastrado."}
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-neutral-50">
            {filtered.map((t) => (
              <div key={t.id} className="px-5 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
                    style={{ backgroundColor: t.themePrimaryColor }}
                  >
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900 text-sm truncate">{t.name}</p>
                    <code className="text-[11px] text-neutral-400">/{t.slug}</code>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(t.id, t.active)}
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                      t.active
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${t.active ? "bg-emerald-500" : "bg-neutral-400"}`} />
                    {t.active ? "Ativo" : "Inativo"}
                  </button>
                  <Link
                    href={`/admin/tenants/${t.id}`}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                    title="Ver detalhes"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    disabled={deletingId === t.id}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                    title="Deletar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-400">Cliente</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-400">Domínio</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-400">Seções</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-400">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-neutral-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
                          style={{ backgroundColor: t.themePrimaryColor }}
                        >
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{t.name}</p>
                          <code className="text-[11px] text-neutral-400">/{t.slug}</code>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500 text-xs">
                      {t.domain ?? <span className="text-neutral-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600 tabular-nums">{t._count.sections}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleActive(t.id, t.active)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                          t.active
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${t.active ? "bg-emerald-500" : "bg-neutral-400"}`}
                        />
                        {t.active ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/tenants/${t.id}`}
                          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                          title="Ver detalhes"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/tenants/${t.id}/edit`}
                          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(t.id, t.name)}
                          disabled={deletingId === t.id}
                          className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                          title="Deletar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
