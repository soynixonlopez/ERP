"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/tables/data-table";
import { ApproveReservationButton } from "@/features/admin/components/approve-reservation-button";

export type AdminReservationRow = {
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

export function AdminReservationsTable({ rows }: { rows: AdminReservationRow[] }): JSX.Element {
  return <DataTable data={rows} columns={columns} />;
}

