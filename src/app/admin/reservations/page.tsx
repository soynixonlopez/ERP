import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EPR_ORGANIZATION_ID } from "@/features/events/data";
import { AdminReservationsTable, type AdminReservationRow } from "@/features/admin/components/admin-reservations-table";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage(): Promise<JSX.Element> {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("reservations")
    .select(
      "id, organization_id, reservation_number, buyer_name, buyer_email, status, payment_status, total, events(title), reservation_items(quantity), attendees(qr_code)"
    )
    .eq("organization_id", EPR_ORGANIZATION_ID)
    .order("created_at", { ascending: false })
    .limit(100);

  const rows: AdminReservationRow[] =
    data?.map((item) => ({
      id: item.id as string,
      organizationId: item.organization_id as string,
      reservationNumber: item.reservation_number as string,
      customerName: item.buyer_name as string,
      email: item.buyer_email as string,
      event: ((item.events as { title?: string } | null)?.title ?? "Evento") as string,
      quantity: ((item.reservation_items as Array<{ quantity?: number }> | null)?.[0]?.quantity ?? 1) as number,
      reservationStatus: item.status as string,
      paymentStatus: item.payment_status as string,
      total: Number(item.total),
      qrCode:
        ((item.attendees as Array<{ qr_code?: string | null }> | null)?.[0]?.qr_code ?? null) as
          | string
          | null
    })) ?? [];

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Gestion de reservas</h1>
        <p className="text-sm text-slate-600">Aprobacion manual de pagos con generacion de invitacion QR.</p>
      </div>
      <AdminReservationsTable rows={rows} />
    </section>
  );
}
