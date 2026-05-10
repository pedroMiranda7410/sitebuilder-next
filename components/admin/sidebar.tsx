"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Upload, LogOut, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/tenants", label: "Clientes", icon: Users, exact: false },
  { href: "/admin/import", label: "Importar JSON", icon: Upload, exact: false },
];

interface AdminSidebarProps {
  userEmail: string;
  userName: string;
  signOutAction: () => Promise<void>;
}

export function AdminSidebar({ userEmail, userName, signOutAction }: AdminSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const initials = (userName || userEmail).charAt(0).toUpperCase();

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-60 flex flex-col z-30"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">
            site<span className="text-white/40">builder</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">
          Principal
        </p>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-white/12 text-white font-medium"
                  : "text-white/60 hover:bg-white/7 hover:text-white/90"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/80 truncate">{userName || userEmail}</p>
            {userName && (
              <p className="text-[10px] text-white/40 truncate">{userEmail}</p>
            )}
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-white/50 hover:bg-white/7 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
