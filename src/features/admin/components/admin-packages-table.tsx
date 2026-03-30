"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Filter, Pencil, Search, Trash2 } from "lucide-react";
import { deleteTicketAction } from "@/features/admin/actions/catalog-actions";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export type AdminPackageListItem = {
  id: string;
  name: string;
  event_id: string;
  event_title: string;
  price: number;
  is_active: boolean;
  visibility: string;
  badge_label: string | null;
  sold: number;
  inventory: number;
};

function fold(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function formatPrice(n: number): string {
  return `$${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
}

type AdminPackagesTableProps = {
  rows: AdminPackageListItem[];
  events: { id: string; title: string }[];
};

export function AdminPackagesTable({ rows, events }: AdminPackagesTableProps): React.JSX.Element {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [eventId, setEventId] = useState<string>("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [onlyPublic, setOnlyPublic] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return rows.filter((r) => {
      if (eventId && r.event_id !== eventId) {
        return false;
      }
      if (onlyActive && !r.is_active) {
        return false;
      }
      if (onlyPublic && r.visibility !== "public") {
        return false;
      }
      if (onlyAvailable && r.sold >= r.inventory) {
        return false;
      }
      if (!q) {
        return true;
      }
      const hay = fold(
        [
          r.name,
          r.event_title,
          r.badge_label ?? "",
          r.visibility,
          r.is_active ? "activo" : "inactivo",
          "agotado",
          formatPrice(r.price),
          String(r.inventory),
          String(r.sold),
          String(Math.max(0, r.inventory - r.sold))
        ].join(" ")
      );
      return hay.includes(q);
    });
  }, [rows, query, eventId, onlyActive, onlyPublic, onlyAvailable]);

  function handleDelete(row: AdminPackageListItem) {
    if (
      !confirm(
        `¿Eliminar el paquete «${row.name}»?\n\nSi ya se vendió en alguna reserva, no se podrá borrar.`
      )
    ) {
      return;
    }
    setDeletingId(row.id);
    startTransition(async () => {
      const res = await deleteTicketAction(row.id);
      setDeletingId(null);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  const activeFilters = (onlyActive ? 1 : 0) + (onlyPublic ? 1 : 0) + (onlyAvailable ? 1 : 0) + (eventId ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="relative min-w-0 flex-1 max-w-xl">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Buscar por nombre, evento, etiqueta, precio, inventario…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 pl-10"
            aria-label="Buscar paquetes"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <label className="flex min-w-[12rem] flex-col gap-1 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <Filter className="size-3.5" aria-hidden />
              Evento
            </span>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-medium text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <option value="">Todos los eventos</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-slate-500">
            {filtered.length === rows.length
              ? `${rows.length} paquete(s)`
              : `${filtered.length} de ${rows.length} paquete(s)`}
            {activeFilters > 0 ? ` · ${activeFilters} filtro(s)` : null}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOnlyActive((v) => !v)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
            onlyActive
              ? "border-emerald-500 bg-emerald-50 text-emerald-900"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          Solo activos
        </button>
        <button
          type="button"
          onClick={() => setOnlyPublic((v) => !v)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
            onlyPublic
              ? "border-sky-500 bg-sky-50 text-sky-900"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          Solo públicos
        </button>
        <button
          type="button"
          onClick={() => setOnlyAvailable((v) => !v)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
            onlyAvailable
              ? "border-amber-500 bg-amber-50 text-amber-900"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          Con cupos (no agotado)
        </button>
        {(onlyActive || onlyPublic || onlyAvailable || eventId) && (
          <button
            type="button"
            onClick={() => {
              setOnlyActive(false);
              setOnlyPublic(false);
              setOnlyAvailable(false);
              setEventId("");
            }}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Etiqueta</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Cupos</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No hay paquetes. Añade entradas ligadas a un evento publicado para venderlas en la web.
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  Ningún paquete coincide. Cambia la búsqueda o usa «Limpiar filtros».
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const busy = pending && deletingId === row.id;
                const left = Math.max(0, row.inventory - row.sold);
                return (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-slate-600" title={row.event_title}>
                      {row.event_title}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.badge_label ? (
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                          {row.badge_label}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{formatPrice(row.price)}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">
                      {left} / {row.inventory}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="block text-xs">
                        {row.is_active ? (
                          <span className="text-emerald-700">Activo</span>
                        ) : (
                          <span className="text-slate-500">Inactivo</span>
                        )}
                        {" · "}
                        {row.visibility === "public" ? (
                          <span className="text-sky-700">Público</span>
                        ) : (
                          <span className="text-slate-500">Oculto</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/admin/packages/${row.id}`}
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
