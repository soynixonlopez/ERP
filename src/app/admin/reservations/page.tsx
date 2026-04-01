import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { EPR_ORGANIZATION_ID } from "@/features/events/data";
import { AdminReservationsTable, type AdminReservationRow } from "@/features/admin/components/admin-reservations-table";
import { packageLabelFromItems, type ReservationItemForLabel } from "@/lib/reservations/package-label";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage(): Promise<JSX.Element> {
  const supabase = createSupabaseAdminClient();

  const { data } = await supabase
    .from("reservations")
    .select(
      "id, organization_id, reservation_number, buyer_name, buyer_email, buyer_country, buyer_age, status, payment_status, total, created_at, events(title), reservation_items(quantity, ticket_types(name)), attendees(full_name, email, qr_code, created_at)"
    )
    .eq("organization_id", EPR_ORGANIZATION_ID)
    .order("created_at", { ascending: false })
    .limit(100);

  type AttendeeRow = {
    full_name?: string | null;
    email?: string | null;
    qr_code?: string | null;
    created_at?: string | null;
  };

  const rows: AdminReservationRow[] =
    data?.map((item) => {
      const attendees = (item.attendees as AttendeeRow[] | null) ?? [];
      const byCreated = [...attendees].sort((a, b) =>
        String(a.created_at ?? "").localeCompare(String(b.created_at ?? ""))
      );
      const additionalPersonNames = byCreated
        .filter((a) => a.email == null || String(a.email).trim() === "")
        .map((a) => (typeof a.full_name === "string" ? a.full_name.trim() : ""))
        .filter((n) => n.length > 0);
      const firstQr = byCreated.find((a) => a.qr_code)?.qr_code ?? attendees.find((a) => a.qr_code)?.qr_code ?? null;
      const ageRaw = item.buyer_age;
      const buyerAge =
        ageRaw != null && String(ageRaw).trim() !== "" && Number.isFinite(Number(ageRaw))
          ? Number(ageRaw)
          : null;

      return {
        id: item.id as string,
        organizationId: item.organization_id as string,
        reservationNumber: item.reservation_number as string,
        customerName: item.buyer_name as string,
        email: item.buyer_email as string,
        event: ((item.events as { title?: string } | null)?.title ?? "Evento") as string,
        packageLabel: packageLabelFromItems(item.reservation_items as ReservationItemForLabel[] | null),
        quantity: ((item.reservation_items as Array<{ quantity?: number }> | null)?.[0]?.quantity ?? 1) as number,
        reservationStatus: item.status as string,
        paymentStatus: item.payment_status as string,
        total: Number(item.total),
        createdAt: item.created_at as string,
        qrCode: firstQr as string | null,
        buyerCountry:
          item.buyer_country != null && String(item.buyer_country).trim() !== ""
            ? String(item.buyer_country).trim()
            : null,
        buyerAge,
        additionalPersonNames
      };
    }) ?? [];

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
