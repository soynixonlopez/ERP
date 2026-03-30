"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ImagePlus, Link2 } from "lucide-react";

export type ImageUrlOrFileFieldProps = {
  /** id del input URL (accesibilidad) */
  id: string;
  nameUrl: string;
  nameFile: string;
  label: string;
  /** Texto debajo del título */
  hint?: string;
  defaultUrl?: string;
  placeholderUrl?: string;
};

/**
 * Campo dual: URL o archivo → la acción de servidor prioriza subida a Storage si hay archivo.
 */
export function ImageUrlOrFileField({
  id,
  nameUrl,
  nameFile,
  label,
  hint,
  defaultUrl,
  placeholderUrl
}: ImageUrlOrFileFieldProps): React.JSX.Element {
  const [picked, setPicked] = useState<string | null>(null);
  const fileId = `${id}_file`;

  return (
    <div className="rounded-xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50/90 p-4 shadow-sm ring-1 ring-slate-100/80">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
      {defaultUrl ? (
        <p className="mt-2 truncate text-xs text-slate-500" title={defaultUrl}>
          Guardada: <span className="font-mono text-[11px]">{defaultUrl}</span>
        </p>
      ) : null}

      <div className="mt-3 space-y-3">
        <div className="flex items-start gap-2.5">
          <Link2
            className="mt-2.5 size-4 shrink-0 text-[var(--epr-blue-800)] opacity-90"
            aria-hidden
          />
          <div className="min-w-0 flex-1 space-y-1">
            <label htmlFor={id} className="block cursor-pointer text-xs font-medium text-slate-600">
              Enlace (URL)
            </label>
            <Input
              id={id}
              name={nameUrl}
              type="url"
              placeholder={placeholderUrl ?? "https://ejemplo.com/imagen.jpg"}
              defaultValue={defaultUrl ?? ""}
              className="cursor-text"
            />
          </div>
        </div>

        <div className="relative flex items-center gap-3 py-0.5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-slate-200" />
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            o sube archivo
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 to-slate-200" />
        </div>

        <div className="relative min-h-[5.25rem] overflow-hidden rounded-xl border-2 border-dashed border-[var(--epr-blue-800)]/40 bg-[var(--epr-blue-800)]/[0.07] shadow-sm transition hover:border-[var(--epr-blue-800)]/60 hover:bg-[var(--epr-blue-800)]/12 hover:shadow">
          <input
            type="file"
            name={nameFile}
            id={fileId}
            accept="image/jpeg,image/png,image/webp,image/gif"
            autoComplete="off"
            aria-label={`Subir imagen: ${label}`}
            className="absolute inset-0 z-[1] h-full min-h-[5.25rem] w-full cursor-pointer opacity-0"
            onChange={(e) => setPicked(e.target.files?.[0]?.name ?? null)}
          />
          <div className="pointer-events-none flex min-h-[5.25rem] flex-col items-center justify-center gap-2 px-4 py-3.5">
            <ImagePlus className="size-5 shrink-0 text-[var(--epr-blue-800)]" strokeWidth={2} aria-hidden />
            <span className="text-sm font-bold text-[var(--epr-blue-800)]">Adjuntar imagen</span>
          </div>
        </div>
        {picked ? (
          <p className="text-center text-xs font-medium text-emerald-700">Listo: {picked}</p>
        ) : (
          <p className="text-center text-[11px] text-slate-400">
            JPG, PNG, WebP o GIF · se guarda en Supabase Storage
          </p>
        )}
      </div>
    </div>
  );
}
