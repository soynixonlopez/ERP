import Link from "next/link";
import { ShoppingCart, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canAccessAdminPanel } from "@/lib/auth/admin-access";
import { signOutAction } from "@/features/auth/actions/auth-actions";
import { SiteBrandLogo } from "@/components/layout/site-brand-logo";
import { SiteNav } from "@/components/layout/site-nav";

export async function SiteHeader(): Promise<JSX.Element> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? undefined;
  const shortId = user?.id ? user.id.slice(0, 8) : undefined;
  const isAdmin = user ? await canAccessAdminPanel(user) : false;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur">
      <div className="epr-container flex min-h-16 items-center justify-between gap-2 py-2 sm:min-h-[4.75rem] sm:gap-3 md:py-3">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          aria-label="EPR Reservas"
        >
          <SiteBrandLogo variant="color" context="header" priority />
        </Link>

        <SiteNav />

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link href="/cart" aria-label="Carrito">
            <Button size="sm" variant="secondary">
              <ShoppingCart className="size-4" />
            </Button>
          </Link>

          {user ? (
            <details className="relative">
              <summary className="list-none cursor-pointer">
                <div className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-50">
                  <UserRound className="size-4 text-[var(--primary)]" />
                  <span className="hidden text-sm font-semibold text-slate-900 sm:inline">
                    {fullName ?? "Cuenta"}
                  </span>
                </div>
              </summary>
              <div className="absolute right-0 z-50 mt-2 w-[min(16rem,calc(100vw-1.25rem))] rounded-xl border border-[var(--border)] bg-white p-2 shadow-sm">
                <p className="px-2 py-2 text-xs font-semibold uppercase text-slate-500">
                  {isAdmin ? "Administrador" : fullName ? `Usuario: ${fullName}` : "Usuario"}
                </p>
                {shortId ? (
                  <p className="px-2 pb-3 text-xs text-slate-500">ID: {shortId}</p>
                ) : null}
                <div className="flex flex-col gap-1">
                  {isAdmin ? (
                    <Link href="/admin" className="rounded-lg px-2 py-2 text-sm font-medium hover:bg-slate-50">
                      Dashboard
                    </Link>
                  ) : null}
                  <Link href="/profile" className="rounded-lg px-2 py-2 text-sm font-medium hover:bg-slate-50">
                    Ver perfil
                  </Link>
                  <Link
                    href={isAdmin ? "/admin/reservations" : "/my-reservations"}
                    className="rounded-lg px-2 py-2 text-sm font-medium hover:bg-slate-50"
                  >
                    Reservas
                  </Link>
                  <form action={signOutAction}>
                    <Button className="w-full" variant="secondary" type="submit">
                      Cerrar sesion
                    </Button>
                  </form>
                </div>
              </div>
            </details>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login">
                <Button variant="secondary">Ingresar</Button>
              </Link>
              <Link href="/register">
                <Button>Reservar</Button>
              </Link>
            </div>
          )}

          {/* Menú móvil */}
          <details className="relative md:hidden">
            <summary className="list-none cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-50">
                <div className="space-y-1">
                  <span className="block h-0.5 w-6 bg-[var(--primary)]" />
                  <span className="block h-0.5 w-6 bg-[var(--primary)]" />
                  <span className="block h-0.5 w-6 bg-[var(--primary)]" />
                </div>
              </div>
            </summary>
            <div className="absolute right-0 z-50 mt-2 w-[min(18rem,calc(100vw-1.25rem))] max-w-[calc(100vw-1.25rem)] rounded-xl border border-[var(--border)] bg-white p-3 shadow-sm">
              <nav className="flex flex-col gap-1">
                <Link href="/" className="rounded-lg px-2 py-2 text-sm font-medium hover:bg-slate-50">
                  Inicio
                </Link>
                <Link href="/events" className="rounded-lg px-2 py-2 text-sm font-medium hover:bg-slate-50">
                  Eventos
                </Link>
                <Link href="/packages" className="rounded-lg px-2 py-2 text-sm font-medium hover:bg-slate-50">
                  Paquetes
                </Link>
                <Link
                  href="/my-reservations"
                  className="rounded-lg px-2 py-2 text-sm font-medium hover:bg-slate-50"
                >
                  Mis reservas
                </Link>
                <Link href="/contact" className="rounded-lg px-2 py-2 text-sm font-medium hover:bg-slate-50">
                  Contacto
                </Link>
              </nav>

              <div className="mt-3 border-t border-[var(--border)] pt-3">
                {user ? (
                  <div className="flex flex-col gap-2">
                    {isAdmin ? (
                      <Link href="/admin" className="text-sm font-semibold text-[var(--primary)]">
                        Dashboard
                      </Link>
                    ) : null}
                    <Link href="/profile" className="text-sm font-semibold text-[var(--primary)]">
                      Ver perfil
                    </Link>
                    {isAdmin ? (
                      <Link
                        href="/admin/reservations"
                        className="text-sm font-semibold text-[var(--primary)]"
                      >
                        Reservas
                      </Link>
                    ) : null}
                    <form action={signOutAction}>
                      <Button className="w-full" variant="secondary" type="submit">
                        Cerrar sesion
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login">
                      <Button variant="secondary" className="w-full">
                        Ingresar
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full">Reservar</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
