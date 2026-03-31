"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions/auth-actions";

type SiteHeaderMobileMenuProps = {
  isAdmin: boolean;
  hasUser: boolean;
};

const navLink =
  "cursor-pointer rounded-lg px-2 py-2 text-sm font-medium hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]";

export function SiteHeaderMobileMenu({ isAdmin, hasUser }: SiteHeaderMobileMenuProps): JSX.Element {
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

  return (
    <div className="relative md:hidden" ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <div className="space-y-1" aria-hidden>
          <span className="block h-0.5 w-6 bg-[var(--primary)]" />
          <span className="block h-0.5 w-6 bg-[var(--primary)]" />
          <span className="block h-0.5 w-6 bg-[var(--primary)]" />
        </div>
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(18rem,calc(100vw-1.25rem))] max-w-[calc(100vw-1.25rem)] rounded-xl border border-[var(--border)] bg-white p-3 shadow-sm">
          <nav className="flex flex-col gap-1">
            <Link href="/" className={navLink} onClick={() => setOpen(false)}>
              Inicio
            </Link>
            <Link href="/events" className={navLink} onClick={() => setOpen(false)}>
              Eventos
            </Link>
            <Link href="/packages" className={navLink} onClick={() => setOpen(false)}>
              Paquetes
            </Link>
            <Link href="/my-reservations" className={navLink} onClick={() => setOpen(false)}>
              Mis reservas
            </Link>
            <Link href="/contact" className={navLink} onClick={() => setOpen(false)}>
              Contacto
            </Link>
          </nav>

          <div className="mt-3 border-t border-[var(--border)] pt-3">
            {hasUser ? (
              <div className="flex flex-col gap-2">
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="cursor-pointer text-sm font-semibold text-[var(--primary)] hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : null}
                <Link
                  href="/profile"
                  className="cursor-pointer text-sm font-semibold text-[var(--primary)] hover:underline"
                  onClick={() => setOpen(false)}
                >
                  Ver perfil
                </Link>
                <Link
                  href={isAdmin ? "/admin/reservations" : "/my-reservations"}
                  className="cursor-pointer text-sm font-semibold text-[var(--primary)] hover:underline"
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
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" className="cursor-pointer" onClick={() => setOpen(false)}>
                  <Button variant="secondary" className="w-full cursor-pointer">
                    Ingresar
                  </Button>
                </Link>
                <Link href="/register" className="cursor-pointer" onClick={() => setOpen(false)}>
                  <Button className="w-full cursor-pointer">Reservar</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
