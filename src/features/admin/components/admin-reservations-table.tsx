"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/tables/data-table";
import { Input } from "@/components/ui/input";
import { ReservationActionSelect } from "@/features/admin/components/reservation-action-select";
import { formatEventDate } from "@/lib/utils/date";

export type AdminReservationRow = {
  id: string;
  organizationId: string;
  reservationNumber: string;
  customerName: string;
  email: string;
  event: string;
  /** Nombre(s) del paquete / ticket_type adquirido(s). */
  packageLabel: string;
  quantity: number;
  reservationStatus: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  qrCode: string | null;
};

function rowMatchesQuery(row: AdminReservationRow, raw: string): boolean {
  const q = raw.trim().toLowerCase();
  if (!q) return true;

  const createdFormatted = formatEventDate(row.createdAt).toLowerCase();
  const createdDateOnly = new Date(row.createdAt).toLocaleDateString("es-PA", {
    day: "numeric",
    month: "numeric",
    year: "numeric"
  }).toLowerCase();
  const createdLong = new Date(row.createdAt).toLocaleDateString("es-PA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).toLowerCase();

  const fields = [
    row.customerName,
    row.email,
    row.event,
    row.packageLabel,
    row.reservationNumber,
    row.reservationStatus,
    row.paymentStatus,
    createdFormatted,
    createdDateOnly,
    createdLong,
    row.createdAt,
    String(row.quantity),
    row.total.toFixed(2)
  ].map((s) => String(s).toLowerCase());

  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((tok) => fields.some((f) => f.includes(tok)));
}

const columns: ColumnDef<AdminReservationRow>[] = [
  {
    id: "rowNum",
    header: "#",
    cell: ({ row }) => (
      <span className="tabular-nums font-medium text-slate-600">{row.index + 1}</span>
    ),
    enableSorting: false
  },
  { accessorKey: "reservationNumber", header: "Reserva" },
  {
    id: "createdAt",
    header: "Fecha",
    accessorFn: (r) => r.createdAt,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-slate-700">{formatEventDate(row.original.createdAt)}</span>
    )
  },
  { accessorKey: "customerName", header: "Cliente" },
  { accessorKey: "email", header: "Correo" },
  { accessorKey: "event", header: "Evento" },
  { accessorKey: "packageLabel", header: "Paquete" },
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
      <ReservationActionSelect
        reservationId={row.original.id}
        organizationId={row.original.organizationId}
        status={row.original.reservationStatus}
        paymentStatus={row.original.paymentStatus}
      />
    )
  }
];

export function AdminReservationsTable({ rows }: { rows: AdminReservationRow[] }): JSX.Element {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => rows.filter((r) => rowMatchesQuery(r, query)), [rows, query]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800" htmlFor="reservations-search">
          Buscar reservas
        </label>
        <Input
          id="reservations-search"
          type="search"
          placeholder="Nombre, correo, fecha, evento, paquete, estado o numero de reserva..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xl"
          autoComplete="off"
        />
        <p className="text-xs text-slate-500">
          Mostrando {filtered.length} de {rows.length} reservas
          {query.trim() ? " (filtrado)" : ""}
        </p>
      </div>

      <div className="w-full min-w-0 -mx-1 touch-pan-x px-1 sm:mx-0 sm:px-0">
        <DataTable data={filtered} columns={columns} />
      </div>
    </div>
  );
}
