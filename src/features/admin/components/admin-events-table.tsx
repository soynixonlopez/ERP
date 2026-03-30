"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Search, Trash2 } from "lucide-react";
import { deleteEventAction } from "@/features/admin/actions/catalog-actions";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export type AdminEventListItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  starts_at: string;
  location: string;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  upcoming: "Próximamente",
  sold_out: "Agotado",
  cancelled: "Cancelado"
};

const STATUS_ORDER = ["draft", "upcoming", "published", "sold_out", "cancelled"] as const;

function fold(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

type AdminEventsTableProps = {
  rows: AdminEventListItem[];
};

export function AdminEventsTable({ rows }: AdminEventsTableProps): React.JSX.Element {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return rows.filter((r) => {
      if (statusFilter && r.status !== statusFilter) {
        return false;
      }
      if (!q) {
        return true;
      }
      const hay = fold(
        [
          r.title,
          r.slug,
          r.location,
          STATUS_LABEL[r.status] ?? r.status,
          r.starts_at,
          new Date(r.starts_at).toLocaleDateString("es-PA"),
          new Date(r.starts_at).toLocaleString("es-PA")
        ].join(" ")
      );
      return hay.includes(q);
    });
  }, [rows, query, statusFilter]);

  function handleDelete(row: AdminEventListItem) {
    const label = STATUS_LABEL[row.status] ?? row.status;
    if (
      !confirm(
        `¿Eliminar el evento «${row.title}» (${label})?\n\nSi tiene reservas, la eliminación será rechazada.`
      )
    ) {
      return;
    }
    setDeletingId(row.id);
    startTransition(async () => {
      const res = await deleteEventAction(row.id);
      setDeletingId(null);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  const statusCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) {
      m.set(r.status, (m.get(r.status) ?? 0) + 1);
    }
    return m;
  }, [rows]);

  const statusKeys = useMemo(() => {
    const present = new Set(rows.map((r) => r.status));
    const head = STATUS_ORDER.filter((k) => present.has(k));
    const tail = [...present]
      .filter((k) => !STATUS_ORDER.includes(k as (typeof STATUS_ORDER)[number]))
      .sort();
    return [...head, ...tail];
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative min-w-0 flex-1 max-w-xl">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Buscar por título, slug, ubicación, estado o fecha…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 pl-10"
            aria-label="Buscar eventos"
          />
        </div>
        <p className="text-xs text-slate-500 lg:text-right">
          {filtered.length === rows.length
            ? `${rows.length} evento(s)`
            : `${filtered.length} de ${rows.length} evento(s)`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter(null)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
            statusFilter === null
              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--epr-blue-800)]"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          Todos
        </button>
        {statusKeys.map((key) => {
          const n = statusCounts.get(key) ?? 0;
          if (n === 0 && key !== statusFilter) {
            return null;
          }
          return (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter((prev) => (prev === key ? null : key))}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                statusFilter === key
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--epr-blue-800)]"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {STATUS_LABEL[key] ?? key}
              <span className="ml-1 tabular-nums text-slate-400">({n})</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Ubicación</th>
              <th className="px-4 py-3">Inicio</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No hay eventos. Crea el primero para poblar la homepage y la sección Eventos.
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Ningún evento coincide con la búsqueda o el filtro. Prueba otras palabras o pulsa «Todos».
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const busy = pending && deletingId === row.id;
                return (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.title}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.slug}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {STATUS_LABEL[row.status] ?? row.status}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-slate-600" title={row.location}>
                      {row.location}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {new Date(row.starts_at).toLocaleString("es-PA", {
                        dateStyle: "short",
                        timeStyle: "short"
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/admin/events/${row.id}`}
                          className={cn(
                            buttonVariants({ variant: "secondary", size: "sm" }),
                            "inline-flex gap-1.5"
                          )}
                        >
                          <Pencil className="size-3.5" aria-hidden />
                          Editar
                        </Link>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleDelete(row)}
                          className={cn(
                            buttonVariants({ variant: "secondary", size: "sm" }),
                            "inline-flex gap-1.5 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                          )}
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                          {busy ? "…" : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
