import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { adminTicketsRows } from "@/features/admin/data";
import { CreateTicketForm } from "@/features/admin/components/create-ticket-form";

type AdminTicketRow = (typeof adminTicketsRows)[number];

const columns: ColumnDef<AdminTicketRow>[] = [
  { accessorKey: "name", header: "Paquete" },
  { accessorKey: "label", header: "Etiqueta" },
  { accessorKey: "price", header: "Precio" },
  { accessorKey: "inventory", header: "Inventario" },
  { accessorKey: "sold", header: "Vendidos" }
];

export default function AdminTicketsPage(): JSX.Element {
  const organizationId = "11111111-1111-1111-1111-111111111111";
  const eventId = "22222222-2222-2222-2222-222222222222";

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Gestion de paquetes</h1>
        <p className="text-sm text-slate-600">
          Base inicial para CRUD de paquetes con arquitectura preparada para SaaS.
        </p>
      </div>
      <CreateTicketForm organizationId={organizationId} eventId={eventId} />
      <DataTable data={adminTicketsRows} columns={columns} />
    </section>
  );
}
