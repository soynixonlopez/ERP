import Link from "next/link";

type AdminLayoutProps = {
  children: React.ReactNode;
};

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/events", label: "Eventos" },
  { href: "/admin/tickets", label: "Paquetes" },
  { href: "/admin/reservations", label: "Reservas" }
];

export default function AdminLayout({ children }: AdminLayoutProps): JSX.Element {
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="rounded-xl border border-[var(--border)] bg-white p-4">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Panel admin</h2>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
