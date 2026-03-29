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

      <div className="hidden md:block">
        <DataTable data={filtered} columns={columns} />
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-[var(--border)] bg-white p-4 text-sm text-slate-600">
            {rows.length === 0 ? "No hay reservas registradas." : "Ninguna reserva coincide con la busqueda."}
          </p>
        ) : (
          filtered.map((row, index) => (
            <article key={row.id} className="space-y-3 rounded-xl border border-[var(--border)] bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Reserva</p>
                    <p className="font-bold text-slate-900">{row.reservationNumber}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {row.reservationStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500">{formatEventDate(row.createdAt)}</p>
              <p className="text-sm text-slate-700">{row.customerName}</p>
              <p className="text-sm text-slate-600">{row.email}</p>
              <p className="text-sm text-slate-700">Evento: {row.event}</p>
              <p className="text-sm text-slate-700">Paquete: {row.packageLabel}</p>
              <p className="text-sm text-slate-700">Cantidad: {row.quantity}</p>
              <p className="text-sm text-slate-700">Pago: {row.paymentStatus}</p>
              <p className="text-sm font-semibold text-slate-900">Total: ${row.total.toFixed(2)}</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {row.qrCode ? (
                  <Link className="text-sm font-semibold text-[var(--primary)]" href={`/invite/${row.qrCode}`}>
                    Ver QR
                  </Link>
                ) : (
                  <span className="text-xs text-slate-500">QR pendiente</span>
                )}
                <ReservationActionSelect
                  reservationId={row.id}
                  organizationId={row.organizationId}
                  status={row.reservationStatus}
                  paymentStatus={row.paymentStatus}
                />
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
