import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader(): JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <CalendarDays className="size-5 text-[var(--primary)]" />
          EPR Reservas
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          <Link href="/events">Eventos</Link>
          <Link href="/packages">Paquetes</Link>
          <Link href="/my-reservations">Mis reservas</Link>
          <Link href="/contact">Contacto</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="secondary">Ingresar</Button>
          </Link>
          <Link href="/register">
            <Button>Reservar</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
