import Link from "next/link";
import { CalendarDays, Mail, Phone } from "lucide-react";
import { SiteBrandLogo } from "@/components/layout/site-brand-logo";

export function SiteFooter(): JSX.Element {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--epr-blue-800)]">
      <div className="epr-container pt-12 pb-8 text-white sm:pt-16 md:pt-20 md:pb-10">
        {/* Widgets principales */}
        <div className="grid grid-cols-1 items-start gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          {/* Widget 1: marca + redes */}
          <div className="min-w-0 space-y-4">
            <div className="flex items-center">
              <SiteBrandLogo variant="white" context="footer" />
            </div>

            <p className="text-sm text-white/85">
              Reserva tus paquetes con un proceso claro, seguro y con acompañamiento.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
              <span className="flex items-center gap-2 text-white/90">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-white/10">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4 fill-[var(--accent)]"
                    aria-hidden="true"
                  >
                    <path d="M22 12.06C22 6.504 17.523 2 12 2S2 6.504 2 12.06C2 17.082 5.657 21.243 10.438 22v-7.03H7.898v-2.91h2.54V9.845c0-2.522 1.492-3.915 3.777-3.915 1.094 0 2.238.197 2.238.197v2.475h-1.26c-1.242 0-1.63.776-1.63 1.57v1.888h2.773l-.443 2.91h-2.33V22C18.343 21.243 22 17.082 22 12.06z" />
                  </svg>
                </span>
                Facebook
              </span>
              <span className="flex items-center gap-2 text-white/90">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-white/10">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4 fill-[var(--accent)]"
                    aria-hidden="true"
                  >
                    <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm9 2h-9A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4z" />
                    <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                    <path d="M17.25 6.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                  </svg>
                </span>
                Instagram
              </span>
            </div>
          </div>

          {/* Widget 2: navegación */}
          <div className="min-w-0 space-y-4">
            <p className="text-sm font-semibold md:text-base">Navegación</p>
            <ul className="space-y-2 text-sm text-white/85">
              <li>
                <Link className="hover:text-white" href="/events">Eventos</Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/packages">Paquetes</Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/my-reservations">Mis reservas</Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/nosotros">Sobre nosotros</Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/contact">Contacto</Link>
              </li>
            </ul>
          </div>

          {/* Widget 3: contacto */}
          <div className="min-w-0 space-y-4">
            <p className="text-sm font-semibold md:text-base">Contacto</p>
            <div className="space-y-2 text-sm text-white/85">
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-[var(--accent)]" />
                <span className="font-semibold text-white">+507 6795-8877</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-[var(--accent)]" />
                <span className="break-all font-semibold text-white">ernestopuerta1124@gmail.com</span>
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays className="size-4 text-[var(--accent)]" />
                <span>Lunes a sábado, 8:00 am - 8:00 pm</span>
              </p>
            </div>
          </div>

          {/* Widget 4: acceso al evento */}
          <div className="min-w-0 space-y-4">
            <p className="text-sm font-semibold md:text-base">Acceso al evento</p>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                Consejo rápido
              </p>
              <p className="mt-2 text-sm text-white/85">
                Confirma tu paquete y conserva tu información para el acceso.
              </p>
              <div className="mt-4">
                <Link href="/packages" className="text-sm font-semibold text-[var(--accent)] hover:underline">
                  Ver paquetes disponibles
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer secundario */}
        <div className="mt-12 border-t border-white/15 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-white/70">
              © {new Date().getFullYear()} EPR S.A. - Reservas de eventos
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/75">
              <a href="/privacy" className="hover:text-white">Políticas de Privacidad</a>
              <a href="/terms" className="hover:text-white">Aviso Legal</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
