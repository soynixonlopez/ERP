import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CreateTicketForm } from "@/features/admin/components/create-ticket-form";
import { EPR_ORGANIZATION_ID, EVENT_SUMMER_BEATS_ID } from "@/features/events/data";
import { AdminTicketsTable, type AdminTicketRow } from "@/features/admin/components/admin-tickets-table";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage(): Promise<JSX.Element> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("ticket_types")
    .select("id, name, badge_label, price, inventory, sold")
    .eq("organization_id", EPR_ORGANIZATION_ID)
    .order("sort_order", { ascending: true });

  const rows: AdminTicketRow[] =
    data?.map((t) => ({
      id: t.id as string,
      name: t.name as string,
      label: (t.badge_label as string) ?? "—",
      price: Number(t.price),
      inventory: t.inventory as number,
      sold: t.sold as number
    })) ?? [];

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Gestión de paquetes</h1>
        <p className="text-sm text-slate-600">
          Tipos de entrada en Supabase. Crear paquete asocia al evento Summer Beats (principal).
        </p>
      </div>
      <CreateTicketForm organizationId={EPR_ORGANIZATION_ID} eventId={EVENT_SUMMER_BEATS_ID} />
      <AdminTicketsTable rows={rows} />
    </section>
  );
}
