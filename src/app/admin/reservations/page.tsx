import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/tables/data-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ApproveReservationButton } from "@/features/admin/components/approve-reservation-button";

export const dynamic = "force-dynamic";

type AdminReservationRow = {
  id: string;
  organizationId: string;
  reservationNumber: string;
  customerName: string;
  email: string;
  event: string;
  quantity: number;
  reservationStatus: string;
  paymentStatus: string;
  total: number;
  qrCode: string | null;
};

const columns: ColumnDef<AdminReservationRow>[] = [
  { accessorKey: "reservationNumber", header: "Reserva" },
  { accessorKey: "customerName", header: "Cliente" },
  { accessorKey: "email", header: "Correo" },
  { accessorKey: "event", header: "Evento" },
  { accessorKey: "quantity", header: "Cantidad" },
  { accessorKey: "reservationStatus", header: "Estado reserva" },
  { accessorKey: "paymentStatus", header: "Estado pago" },
  { accessorKey: "total", header: "Total USD" },
  {
    id: "invitation",
    header: "Invitacion",
    cell: ({ row }) =>
      row.original.qrCode ? (
        <Link className="text-sm font-semibold text-[var(--primary)]" href={`/invite/${row.original.qrCode}`}>
          Ver QR
        </Link>
      ) : (
        <span className="text-xs text-slate-500">Pendiente</span>
      )
  },
  {
    id: "actions",
    header: "Accion",
    cell: ({ row }) => (
      <ApproveReservationButton
        reservationId={row.original.id}
        organizationId={row.original.organizationId}
        status={row.original.reservationStatus}
      />
    )
  }
];

export default async function AdminReservationsPage(): Promise<JSX.Element> {
  const organizationId = "11111111-1111-1111-1111-111111111111";
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("reservations")
    .select("id, organization_id, reservation_number, buyer_name, buyer_email, status, payment_status, total, events(title), reservation_items(quantity), attendees(qr_code)")
    .eq("organization_id", organizationId)
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
      qrCode: ((item.attendees as Array<{ qr_code?: string | null }> | null)?.[0]?.qr_code ?? null) as
        | string
        | null
    })) ?? [];

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Gestion de reservas</h1>
        <p className="text-sm text-slate-600">Aprobacion manual de pagos con generacion de invitacion QR.</p>
      </div>
      <DataTable data={rows} columns={columns} />
    </section>
  );
}
