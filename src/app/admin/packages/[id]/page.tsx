import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageEditorForm } from "@/features/admin/components/package-editor-form";
import { fetchAdminEventById, fetchAdminEvents, fetchAdminTicketById } from "@/features/events/server/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

type AdminPackageEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPackageEditPage({ params }: AdminPackageEditPageProps): Promise<JSX.Element> {
  const { id } = await params;
  const [row, allEvents] = await Promise.all([fetchAdminTicketById(id), fetchAdminEvents()]);
  if (!row) {
    notFound();
  }

  const eventOptions = allEvents.map((e) => ({ id: e.id, title: e.title }));
  const ticketEventId = row.event_id;
  const hasEventInList = eventOptions.some((e) => e.id === ticketEventId);
  if (!hasEventInList) {
    const ev = await fetchAdminEventById(ticketEventId);
    if (ev) {
      eventOptions.unshift({ id: ev.id, title: ev.title });
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/packages" className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
          Volver al listado
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-black text-slate-900">Editar paquete</h1>
        <p className="text-sm text-slate-600">{row.name}</p>
      </div>
      <PackageEditorForm initial={row} events={eventOptions} />
    </section>
  );
}
