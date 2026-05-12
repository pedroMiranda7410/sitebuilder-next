import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Users, LayoutDashboard, Calendar, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function AdminDashboard() {
  const session = await auth();

  const [tenantsCount, sectionsCount, eventsCount, signupsCount, recentTenants] =
    await Promise.all([
      prisma.tenant.count({ where: { active: true } }),
      prisma.section.count(),
      prisma.siteEvent.count(),
      prisma.eventSignup.count(),
      prisma.tenant.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { _count: { select: { sections: true } } },
      }),
    ]);

  const metrics = [
    { label: "Clientes ativos", value: tenantsCount, icon: Users, color: "text-blue-500" },
    { label: "Seções cadastradas", value: sectionsCount, icon: LayoutDashboard, color: "text-violet-500" },
    { label: "Eventos", value: eventsCount, icon: Calendar, color: "text-orange-500" },
    { label: "Inscrições", value: signupsCount, icon: UserCheck, color: "text-emerald-500" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Bem-vindo de volta, {session?.user?.name ?? session?.user?.email}
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-neutral-500">{label}</p>
              <div className={`${color} opacity-80`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900 tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent tenants */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-900">Clientes recentes</h2>
          <Link
            href="/admin/tenants"
            className="text-xs text-neutral-500 hover:text-neutral-900 transition"
          >
            Ver todos →
          </Link>
        </div>

        {recentTenants.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-400">
            Nenhum cliente cadastrado ainda.
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="sm:hidden divide-y divide-neutral-50">
              {recentTenants.map((tenant) => {
                const initial = tenant.name.charAt(0).toUpperCase();
                return (
                  <div key={tenant.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
                        style={{ backgroundColor: tenant.themePrimaryColor }}
                      >
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 text-sm truncate">{tenant.name}</p>
                        <p className="text-xs text-neutral-400">/{tenant.slug}</p>
                      </div>
                    </div>
                    <Link
                      href={`/admin/tenants/${tenant.id}`}
                      className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition flex-shrink-0 ml-3"
                    >
                      Ver →
                    </Link>
                  </div>
                );
              })}
            </div>
            {/* Desktop table view */}
            <table className="hidden sm:table w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400">Cadastro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {recentTenants.map((tenant) => {
                  const initial = tenant.name.charAt(0).toUpperCase();
                  return (
                    <tr key={tenant.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
                            style={{ backgroundColor: tenant.themePrimaryColor }}
                          >
                            {initial}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{tenant.name}</p>
                            <p className="text-xs text-neutral-400">/{tenant.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-neutral-500 text-xs">
                        {format(new Date(tenant.createdAt), "d MMM yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                            tenant.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              tenant.active ? "bg-emerald-500" : "bg-neutral-400"
                            }`}
                          />
                          {tenant.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          href={`/admin/tenants/${tenant.id}`}
                          className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition"
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
