import Link from "next/link";
import { fetchAdminEvents } from "@/features/events/server/queries";
import { AdminEventsTable, type AdminEventListItem } from "@/features/admin/components/admin-events-table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage(): Promise<JSX.Element> {
  const rows = await fetchAdminEvents();

  const list: AdminEventListItem[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    status: r.status,
    starts_at: r.starts_at,
    location: r.location
  }));

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Eventos</h1>
          <p className="text-sm text-slate-600">Crea, edita o elimina eventos. La búsqueda ignora tildes y mayúsculas.</p>
        </div>
        <Link href="/admin/events/new" className={cn(buttonVariants({ variant: "accent", size: "md" }))}>
          Nuevo evento
        </Link>
      </div>

      <AdminEventsTable rows={list} />
    </section>
  );
}
