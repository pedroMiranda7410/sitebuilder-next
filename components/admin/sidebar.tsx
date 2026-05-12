"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Upload, LogOut, Layers, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

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
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const initials = (userName || userEmail).charAt(0).toUpperCase();

  const sidebarContent = (showLabels: boolean) => (
    <>
      {/* Logo */}
      <div className={cn("border-b border-white/10", showLabels ? "px-5 py-5" : "px-0 py-5 flex justify-center")}>
        {showLabels ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">
              site<span className="text-white/40">builder</span>
            </span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn("flex-1 py-4 space-y-0.5 overflow-y-auto", showLabels ? "px-3" : "px-2")}>
        {showLabels && (
          <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">
            Principal
          </p>
        )}
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              title={!showLabels ? label : undefined}
              className={cn(
                "flex items-center rounded-lg text-sm transition-colors",
                showLabels ? "gap-2.5 px-2.5 py-2" : "justify-center p-2.5",
                active
                  ? "bg-white/12 text-white font-medium"
                  : "text-white/60 hover:bg-white/7 hover:text-white/90"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {showLabels && label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className={cn("py-4 border-t border-white/10", showLabels ? "px-3" : "px-2")}>
        {showLabels ? (
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
        ) : (
          <div className="flex justify-center py-1 mb-1">
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
          </div>
        )}
        <form action={signOutAction}>
          <button
            type="submit"
            title={!showLabels ? "Sair" : undefined}
            className={cn(
              "w-full flex items-center rounded-lg text-sm text-white/50 hover:bg-white/7 hover:text-red-400 transition-colors",
              showLabels ? "gap-2.5 px-2.5 py-2" : "justify-center p-2.5"
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {showLabels && "Sair"}
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="fixed top-0 left-0 right-0 h-14 flex items-center px-4 z-30 md:hidden"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">
            site<span className="text-white/40">builder</span>
          </span>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 flex flex-col z-50 transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">
              site<span className="text-white/40">builder</span>
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
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

      {/* Tablet sidebar: icon-only, 64px */}
      <aside
        className="fixed top-0 left-0 h-screen w-16 flex-col z-30 hidden md:flex lg:hidden"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        {sidebarContent(false)}
      </aside>

      {/* Desktop sidebar: full, 240px */}
      <aside
        className="fixed top-0 left-0 h-screen w-60 flex-col z-30 hidden lg:flex"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        {sidebarContent(true)}
      </aside>
    </>
  );
}
