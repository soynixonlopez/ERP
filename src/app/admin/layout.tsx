import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Calendar, Ticket, ClipboardList, LogOut } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canAccessAdminPanel } from "@/lib/auth/admin-access";
import { signOutAction } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Eventos", icon: Calendar },
  { href: "/admin/tickets", label: "Paquetes", icon: Ticket },
  { href: "/admin/reservations", label: "Reservas", icon: ClipboardList }
];

type AdminRootLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminRootLayout({ children }: AdminRootLayoutProps): Promise<JSX.Element> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (!(await canAccessAdminPanel(user))) {
    redirect("/my-reservations");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-end border-b border-slate-200 bg-white px-4 shadow-sm">
        <form action={signOutAction}>
          <Button type="submit" variant="secondary" size="sm" className="gap-2">
            <LogOut className="size-4" aria-hidden />
            Cerrar sesión
          </Button>
        </form>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white md:block">
          <div className="p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Panel admin</p>
            <nav className="mt-4 space-y-1">
              {nav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Icon className="size-4 shrink-0 text-slate-500" aria-hidden />
                  {label}
                </Link>
              ))}
            </nav>
            <Link
              href="/"
              className="mt-6 block rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            >
              Ir al sitio público
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main>
      </div>

      <nav className="border-t border-slate-200 bg-white p-2 md:hidden">
        <div className="flex justify-around gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium text-slate-600"
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
