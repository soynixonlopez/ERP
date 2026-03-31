import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canAccessAdminPanel } from "@/lib/auth/admin-access";
import { SiteBrandLogo } from "@/components/layout/site-brand-logo";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteHeaderUserMenu } from "@/components/layout/site-header-user-menu";
import { SiteHeaderMobileMenu } from "@/components/layout/site-header-mobile-menu";

export async function SiteHeader(): Promise<JSX.Element> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? undefined;
  const shortId = user?.id ? user.id.slice(0, 8) : undefined;
  const isAdmin = user ? await canAccessAdminPanel(user) : false;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur print:hidden">
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
          <Link href="/cart" aria-label="Carrito" className="cursor-pointer">
            <Button size="sm" variant="secondary" className="cursor-pointer">
              <ShoppingCart className="size-4" />
            </Button>
          </Link>

          {user ? (
            <SiteHeaderUserMenu fullName={fullName} shortId={shortId} isAdmin={isAdmin} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="cursor-pointer">
                <Button variant="secondary" className="cursor-pointer">
                  Ingresar
                </Button>
              </Link>
              <Link href="/register" className="cursor-pointer">
                <Button className="cursor-pointer">Reservar</Button>
              </Link>
            </div>
          )}

          <SiteHeaderMobileMenu isAdmin={isAdmin} hasUser={!!user} />
        </div>
      </div>
    </header>
  );
}
