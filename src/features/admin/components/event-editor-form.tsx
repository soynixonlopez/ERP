"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveEventAction, type CatalogActionResult } from "@/features/admin/actions/catalog-actions";
import { ImageUrlOrFileField } from "@/features/admin/components/image-url-or-file-field";
import type { AdminEventRow } from "@/features/events/server/queries";

function isoToDatetimeLocal(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function slugifyTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type EventEditorFormProps = {
  initial: AdminEventRow | null;
};

export function EventEditorForm({ initial }: EventEditorFormProps): React.JSX.Element {
  const router = useRouter();
  const slugTouched = useRef(false);
  const [title, setTitle] = useState(initial?.title ?? "");

  const [state, formAction, pending] = useActionState<CatalogActionResult | null, FormData>(
    saveEventAction,
    null
  );

  useEffect(() => {
    if (state?.ok) {
      router.push("/admin/events");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-8">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      {state && !state.ok ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      ) : null}

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Datos del evento</h2>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="title">
            Título
          </label>
          <Input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => {
              const v = e.target.value;
              setTitle(v);
              if (!slugTouched.current) {
                const slugInput = document.getElementById("slug") as HTMLInputElement | null;
                if (slugInput) {
                  slugInput.value = slugifyTitle(v);
                }
              }
            }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="slug">
            Slug (URL)
          </label>
          <Input
            id="slug"
            name="slug"
            required
            defaultValue={initial?.slug ?? ""}
            onChange={() => {
              slugTouched.current = true;
            }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="short_description">
            Descripción corta (tarjetas)
          </label>
          <textarea
            id="short_description"
            name="short_description"
            rows={2}
            defaultValue={initial?.short_description ?? ""}
            className="w-full rounded-lg border border-[var(--border)] bg-white px-3.5 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="description">
            Descripción completa
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={initial?.description ?? ""}
            className="w-full rounded-lg border border-[var(--border)] bg-white px-3.5 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="location">
            Ubicación
          </label>
          <Input id="location" name="location" required defaultValue={initial?.location ?? ""} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="starts_at">
              Inicio
            </label>
            <Input
              id="starts_at"
              name="starts_at"
              type="datetime-local"
              required
              defaultValue={initial?.starts_at ? isoToDatetimeLocal(initial.starts_at) : ""}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="ends_at">
              Fin
            </label>
            <Input
              id="ends_at"
              name="ends_at"
              type="datetime-local"
              required
              defaultValue={initial?.ends_at ? isoToDatetimeLocal(initial.ends_at) : ""}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="status">
            Estado catálogo
          </label>
          <select
            id="status"
            name="status"
            required
            defaultValue={initial?.status ?? "draft"}
            className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <option value="draft">Borrador (no visible en web)</option>
            <option value="upcoming">Próximamente (visible)</option>
            <option value="published">Publicado (visible)</option>
            <option value="sold_out">Agotado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Imagen promocional</h2>
        <p className="text-sm text-slate-600">
          Se usa en tarjetas de evento y como respaldo visual. Puedes pegar una URL o subir archivo (Storage tiene
          prioridad).
        </p>
        <ImageUrlOrFileField
          id="cover_image_url"
          nameUrl="cover_image_url"
          nameFile="cover_file"
          label="Portada del evento"
          hint="Si una extensión del navegador bloquea el cuadro de adjunto, usa la URL o prueba en ventana de incógnito."
          defaultUrl={initial?.cover_image_url ?? undefined}
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar evento"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/events")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
