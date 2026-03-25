"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/events", label: "Eventos" },
  { href: "/packages", label: "Paquetes" },
  { href: "/my-reservations", label: "Mis reservas" },
  { href: "/contact", label: "Contacto" }
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav(): JSX.Element {
  const pathname = usePathname();

  return (
    <nav
      className="hidden min-w-0 flex-1 items-center justify-center gap-3 text-xs font-medium text-slate-700 md:flex lg:gap-4 lg:text-sm xl:gap-5"
      aria-label="Navegación"
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "relative py-2 transition-colors",
              active ? "text-[var(--epr-blue-800)]" : "hover:text-[var(--epr-blue-800)]"
            ].join(" ")}
          >
            {item.label}
            {active ? (
              <span className="absolute -bottom-1 left-0 h-1 w-10 rounded-full bg-[var(--accent)]" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

