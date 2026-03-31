"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ScanLine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions/auth-actions";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Eventos", icon: CalendarRange },
  { href: "/admin/packages", label: "Paquetes", icon: Package },
  { href: "/admin/reservations", label: "Reservas", icon: ClipboardList },
  { href: "/admin/check-in", label: "Control de acceso", icon: ScanLine }
];

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps): React.JSX.Element {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menu admin"
          >
            <Menu className="size-5" />
          </button>

          <Link href="/admin" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Image
              src="/assets/imagenes/LogoHorizontalColor.png"
              alt="EPR S.A."
              width={200}
              height={44}
              className="h-9 w-auto max-w-[min(48vw,220px)] shrink-0 object-contain object-left sm:h-10 sm:max-w-[240px]"
              unoptimized
            />
            <span className="hidden border-l border-slate-200 pl-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:inline">
              Panel admin
            </span>
          </Link>
        </div>

        <form action={signOutAction}>
          <Button type="submit" variant="secondary" size="sm" className="gap-1.5 px-2 sm:gap-2 sm:px-3">
            <LogOut className="size-4 shrink-0" aria-hidden />
            <span className="max-sm:sr-only">Cerrar sesión</span>
          </Button>
        </form>
      </header>

      <div className="flex flex-1">
        <aside
          className={`${
            collapsed ? "w-[88px]" : "w-56"
          } hidden shrink-0 border-r border-slate-200 bg-white transition-all duration-200 md:block`}
        >
          <div className="p-3">
            <div className="mb-3 flex items-center justify-between">
              {!collapsed ? (
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Panel admin</p>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600"
                onClick={() => setCollapsed((v) => !v)}
                aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
              >
                {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
              </button>
            </div>

            <nav className="space-y-1">
              {nav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Icon className="size-4 shrink-0 text-slate-500" aria-hidden />
                  {!collapsed ? <span>{label}</span> : null}
                </Link>
              ))}
            </nav>

            <Link
              href="/"
              className="mt-6 block rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            >
              {!collapsed ? "Ir al sitio público" : "Sitio"}
            </Link>
          </div>
        </aside>

        {mobileOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 top-14 z-30 bg-black/40 md:hidden"
              aria-label="Cerrar menu"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-14 left-0 z-40 w-[min(16rem,calc(100vw-1rem))] border-r border-slate-200 bg-white p-3 shadow-lg md:hidden">
              <nav className="space-y-1">
                {nav.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Icon className="size-4 shrink-0 text-slate-500" aria-hidden />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
            </aside>
          </>
        ) : null}

        <main className="min-w-0 flex-1 p-3 sm:p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
