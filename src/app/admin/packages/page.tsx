import Link from "next/link";
import { fetchAdminEvents, fetchAdminTickets } from "@/features/events/server/queries";
import {
  AdminPackagesTable,
  type AdminPackageListItem
} from "@/features/admin/components/admin-packages-table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

function eventTitle(row: Awaited<ReturnType<typeof fetchAdminTickets>>[0]): string {
  const e = row.events;
  if (!e) return "—";
  return (Array.isArray(e) ? e[0]?.title : e.title) ?? "—";
}

function numPrice(p: string | number): number {
  return typeof p === "number" ? p : Number.parseFloat(String(p));
}

export default async function AdminPackagesPage(): Promise<JSX.Element> {
  const [tickets, events] = await Promise.all([fetchAdminTickets(), fetchAdminEvents()]);
  const eventOptions = events.map((e) => ({ id: e.id, title: e.title }));

  const list: AdminPackageListItem[] = tickets.map((t) => ({
    id: t.id,
    name: t.name,
    event_id: t.event_id,
    event_title: eventTitle(t),
    price: numPrice(t.price),
    is_active: t.is_active,
    visibility: t.visibility,
    badge_label: t.badge_label,
    sold: t.sold,
    inventory: t.inventory
  }));

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Paquetes</h1>
          <p className="text-sm text-slate-600">
            Busca, filtra por evento o estado, edita o elimina. No se puede borrar si ya hay reservas con ese paquete.
          </p>
        </div>
        {eventOptions.length > 0 ? (
          <Link href="/admin/packages/new" className={cn(buttonVariants({ variant: "accent", size: "md" }))}>
            Nuevo paquete
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "accent", size: "md" }),
              "pointer-events-none opacity-50"
            )}
          >
            Nuevo paquete
          </span>
        )}
      </div>

      {eventOptions.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Crea al menos un evento antes de añadir paquetes.
        </p>
      ) : null}

      <AdminPackagesTable rows={list} events={eventOptions} />
    </section>
  );
}
