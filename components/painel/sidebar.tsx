"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Calendar,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/painel", label: "Meu Site", icon: LayoutGrid, exact: true },
  { href: "/painel/eventos", label: "Eventos", icon: Calendar, exact: false },
  { href: "/painel/newsletter", label: "Contatos", icon: Users, exact: false },
  { href: "/painel/configuracoes", label: "Configurações", icon: Settings, exact: false },
];

interface PainelSidebarProps {
  tenantName: string;
  tenantSlug: string;
  tenantPrimaryColor: string;
  userName: string;
  userEmail: string;
  signOutAction: () => Promise<void>;
}

export function PainelSidebar({
  tenantName,
  tenantSlug,
  tenantPrimaryColor,
  userName,
  userEmail,
  signOutAction,
}: PainelSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const displayName = userName || userEmail;
  const initial = displayName.charAt(0).toUpperCase();

  const SidebarContent = () => (
    <>
      {/* Logo / tenant */}
      <div className="px-5 pt-6 pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ backgroundColor: tenantPrimaryColor }}
          >
            {tenantName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-neutral-900 text-sm leading-tight truncate">
              {tenantName}
            </p>
            <p className="text-xs text-neutral-400 truncate">/{tenantSlug}</p>
          </div>
        </div>

        <a
          href={`/api/site/${tenantSlug}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: tenantPrimaryColor, color: "#fff" }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ver meu site
        </a>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors",
                active
                  ? "bg-neutral-950 text-white font-medium"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-neutral-100">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: tenantPrimaryColor }}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-neutral-800 truncate">{displayName}</p>
            {userName && (
              <p className="text-[10px] text-neutral-400 truncate">{userEmail}</p>
            )}
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sair
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white border border-neutral-200 shadow-sm"
        onClick={() => setMobileOpen((v) => !v)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — fixed on desktop, overlay on mobile */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-white border-r border-neutral-100 flex flex-col z-40 transition-transform duration-200",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
