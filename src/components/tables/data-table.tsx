"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState
} from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type DataTableProps<TData extends object> = {
  data: TData[];
  columns: ColumnDef<TData>[];
};

export function DataTable<TData extends object>({ data, columns }: DataTableProps<TData>): JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting }
  });

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white [-webkit-overflow-scrolling:touch] touch-pan-x">
        <table className="w-full min-w-max text-sm">
          <thead className="border-b border-[var(--border)] bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap px-3 py-2 text-left align-middle font-semibold text-slate-700"
                  >
                    {header.isPlaceholder ? null : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto max-w-none whitespace-nowrap p-0 text-left hover:bg-transparent"
                        onClick={header.column.getToggleSortingHandler()}
                        type="button"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </Button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-[var(--border)]">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-3 py-3 align-middle text-slate-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 ? <p className="text-sm text-slate-500">Sin datos disponibles.</p> : null}
    </div>
  );
}
