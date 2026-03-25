import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { adminEventsRows } from "@/features/admin/data";
import { CreateEventForm } from "@/features/admin/components/create-event-form";

type AdminEventRow = (typeof adminEventsRows)[number];

const columns: ColumnDef<AdminEventRow>[] = [
  { accessorKey: "title", header: "Titulo" },
  { accessorKey: "slug", header: "Slug" },
  { accessorKey: "location", header: "Ubicacion" },
  { accessorKey: "startAt", header: "Inicio" },
  { accessorKey: "status", header: "Estado" }
];

export default function AdminEventsPage(): JSX.Element {
  const organizationId = "11111111-1111-1111-1111-111111111111";

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Gestion de eventos</h1>
        <p className="text-sm text-slate-600">
          Base inicial para CRUD multi-tenant. En fase siguiente se conecta a mutaciones server-side.
        </p>
      </div>
      <CreateEventForm organizationId={organizationId} />
      <DataTable data={adminEventsRows} columns={columns} />
    </section>
  );
}
