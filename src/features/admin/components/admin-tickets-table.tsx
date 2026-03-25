"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";

export type AdminTicketRow = {
  id: string;
  name: string;
  label: string;
  price: number;
  inventory: number;
  sold: number;
};

const columns: ColumnDef<AdminTicketRow>[] = [
  { accessorKey: "name", header: "Paquete" },
  { accessorKey: "label", header: "Etiqueta" },
  {
    accessorKey: "price",
    header: "Precio USD",
    cell: ({ row }) => `$${Number(row.original.price).toFixed(2)}`
  },
  { accessorKey: "inventory", header: "Inventario" },
  { accessorKey: "sold", header: "Vendidos" }
];

export function AdminTicketsTable({ rows }: { rows: AdminTicketRow[] }): JSX.Element {
  return <DataTable data={rows} columns={columns} />;
}

