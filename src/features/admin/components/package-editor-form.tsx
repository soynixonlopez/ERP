"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveTicketAction, type CatalogActionResult } from "@/features/admin/actions/catalog-actions";
import type { AdminTicketRow } from "@/features/events/server/queries";

type EventOption = { id: string; title: string };

type PackageEditorFormProps = {
  initial: AdminTicketRow | null;
  events: EventOption[];
};

export function PackageEditorForm({ initial, events }: PackageEditorFormProps): React.JSX.Element {
  const router = useRouter();

  const [state, formAction, pending] = useActionState<CatalogActionResult | null, FormData>(
    saveTicketAction,
    null
  );

  useEffect(() => {
    if (state?.ok) {
      router.push("/admin/packages");
      router.refresh();
    }
  }, [state, router]);

  const evJoin = initial?.events;
  const defaultEventId =
    initial?.event_id ??
    (Array.isArray(evJoin) ? evJoin[0]?.id : evJoin?.id) ??
    events[0]?.id ??
    "";

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-6">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      {state && !state.ok ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      ) : null}

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Paquete / tipo de entrada</h2>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="event_id">
            Evento
          </label>
          <select
            id="event_id"
            name="event_id"
            required
            defaultValue={defaultEventId}
            className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="name">
            Nombre del paquete
          </label>
          <Input id="name" name="name" required defaultValue={initial?.name ?? ""} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="description">
            Beneficios (uno por línea)
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={initial?.description ?? ""}
            className="w-full rounded-lg border border-[var(--border)] bg-white px-3.5 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="badge_label">
              Etiqueta
            </label>
            <select
              id="badge_label"
              name="badge_label"
              defaultValue={(initial?.badge_label ?? "GENERAL").toUpperCase()}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <option value="VIP">VIP</option>
              <option value="PLATINO">PLATINO</option>
              <option value="GENERAL">GENERAL</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="price">
              Precio (USD)
            </label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              required
              defaultValue={initial != null ? String(initial.price) : ""}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="inventory">
              Inventario
            </label>
            <Input
              id="inventory"
              name="inventory"
              type="number"
              min={0}
              required
              defaultValue={initial != null ? String(initial.inventory) : ""}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="sort_order">
              Orden
            </label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={initial != null ? String(initial.sort_order) : "0"}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="visibility">
              Visibilidad web
            </label>
            <select
              id="visibility"
              name="visibility"
              defaultValue={initial?.visibility ?? "public"}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <option value="public">Público</option>
              <option value="hidden">Oculto</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="is_active">
              Activo para venta
            </label>
            <select
              id="is_active"
              name="is_active"
              defaultValue={initial?.is_active === false ? "false" : "true"}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Imagen promocional</h2>
        <input
          type="hidden"
          name="promotional_image_url"
          defaultValue={initial?.promotional_image_url ?? ""}
        />
        {initial?.promotional_image_url ? (
          <p className="text-xs text-slate-500 break-all">Actual: {initial.promotional_image_url}</p>
        ) : null}
        <Input id="promo_file" name="promo_file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar paquete"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/packages")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
