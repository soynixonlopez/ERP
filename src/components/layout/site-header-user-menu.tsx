"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions/auth-actions";

type SiteHeaderUserMenuProps = {
  fullName?: string;
  shortId?: string;
  isAdmin: boolean;
};

export function SiteHeaderUserMenu({ fullName, shortId, isAdmin }: SiteHeaderUserMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onDocMouseDown);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const linkClass =
    "cursor-pointer rounded-lg px-2 py-2 text-sm font-medium hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]";

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <UserRound className="size-4 text-[var(--primary)]" aria-hidden />
        <span className="hidden text-sm font-semibold text-slate-900 sm:inline">{fullName ?? "Cuenta"}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[min(16rem,calc(100vw-1.25rem))] rounded-xl border border-[var(--border)] bg-white p-2 shadow-sm"
        >
          <p className="px-2 py-2 text-xs font-semibold uppercase text-slate-500">
            {isAdmin ? "Administrador" : fullName ? `Usuario: ${fullName}` : "Usuario"}
          </p>
          {shortId ? <p className="px-2 pb-3 text-xs text-slate-500">ID: {shortId}</p> : null}
          <div className="flex flex-col gap-1">
            {isAdmin ? (
              <Link href="/admin" role="menuitem" className={linkClass} onClick={() => setOpen(false)}>
                Dashboard
              </Link>
            ) : null}
            <Link href="/profile" role="menuitem" className={linkClass} onClick={() => setOpen(false)}>
              Ver perfil
            </Link>
            <Link
              href={isAdmin ? "/admin/reservations" : "/my-reservations"}
              role="menuitem"
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              Reservas
            </Link>
            <form action={signOutAction}>
              <Button className="w-full cursor-pointer" variant="secondary" type="submit">
                Cerrar sesion
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
