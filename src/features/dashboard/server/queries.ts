import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type DashboardMetric = {
  label: string;
  value: string;
  hint?: string;
};

export type RecentReservationAdminRow = {
  reservationNumber: string;
  customer: string;
  event: string;
  total: string;
  reservationStatus: string;
  paymentStatus: string;
};

function eventTitleFromEmbed(events: unknown): string {
  if (!events) return "Evento";
  if (Array.isArray(events)) return (events[0] as { title?: string })?.title ?? "Evento";
  return (events as { title?: string }).title ?? "Evento";
}

export async function getDashboardMetrics(organizationId: string): Promise<DashboardMetric[]> {
  const supabase = createSupabaseAdminClient();

  const { count: totalReservations } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  const { count: confirmed } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "confirmed");

  const { count: pendingPayment } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "pending_payment");

  const { data: paidTotals } = await supabase
    .from("reservations")
    .select("total")
    .eq("organization_id", organizationId)
    .eq("payment_status", "paid");

  const revenue = paidTotals?.reduce((acc, r) => acc + Number(r.total), 0) ?? 0;

  const { count: publishedEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "published");

  const { data: userRows } = await supabase
    .from("reservations")
    .select("user_id")
    .eq("organization_id", organizationId)
    .not("user_id", "is", null);

  const uniqueBuyers = new Set(userRows?.map((r) => r.user_id).filter(Boolean)).size;

  return [
    { label: "Reservas totales", value: String(totalReservations ?? 0), hint: "En esta organización" },
    { label: "Reservas confirmadas", value: String(confirmed ?? 0), hint: "Estado: confirmado" },
    { label: "Pendientes de pago", value: String(pendingPayment ?? 0), hint: "Estado: pending_payment" },
    { label: "Ingresos (pagados)", value: `$${revenue.toFixed(2)} USD`, hint: "Suma de totales pagados" },
    { label: "Eventos publicados", value: String(publishedEvents ?? 0), hint: "Visibles en web" },
    { label: "Clientes con reserva", value: String(uniqueBuyers), hint: "Usuarios únicos (cuenta)" }
  ];
}

export async function getRecentReservationsAdmin(
  organizationId: string,
  limit: number
): Promise<RecentReservationAdminRow[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("reservations")
    .select("reservation_number, buyer_name, total, status, payment_status, events(title)")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    return [];
  }

  return data.map((r) => ({
    reservationNumber: r.reservation_number as string,
    customer: r.buyer_name as string,
    event: eventTitleFromEmbed(r.events),
    total: `$${Number(r.total).toFixed(2)}`,
    reservationStatus: r.status as string,
    paymentStatus: r.payment_status as string
  }));
}
