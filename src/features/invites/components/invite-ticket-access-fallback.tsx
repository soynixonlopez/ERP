"use client";

import { useCallback, useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type InviteTicketAccessFallbackProps = {
  invitationUrl: string;
  qrToken: string;
};

export function InviteTicketAccessFallback({
  invitationUrl,
  qrToken
}: InviteTicketAccessFallbackProps): JSX.Element {
  const [copied, setCopied] = useState<"url" | "token" | null>(null);

  const flash = useCallback((key: "url" | "token") => {
    setCopied(key);
    window.setTimeout(() => setCopied(null), 2000);
  }, []);

  const copyText = useCallback(
    async (text: string, key: "url" | "token") => {
      try {
        await navigator.clipboard.writeText(text);
        flash(key);
      } catch {
        /* clipboard no disponible */
      }
    },
    [flash]
  );

  return (
    <section
      className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 print:border-slate-300 print:bg-white"
      aria-labelledby="access-fallback-heading"
    >
      <h3 id="access-fallback-heading" className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        Validación sin lector QR
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        Si el código no se lee en acceso, el personal puede registrar la entrada con la URL del ticket o con el
        identificador siguiente (equivale al contenido del QR).
      </p>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">URL del ticket</dt>
          <dd className="mt-2 break-all font-mono text-xs leading-snug text-slate-900">{invitationUrl}</dd>
          <dd className="mt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void copyText(invitationUrl, "url")}
            >
              {copied === "url" ? (
                <>
                  <Check className="mr-2 size-4 text-slate-600" aria-hidden />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="mr-2 size-4" aria-hidden />
                  Copiar
                </>
              )}
            </Button>
          </dd>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Identificador</dt>
          <dd className="mt-2 select-all break-all font-mono text-xs font-medium text-slate-900 sm:text-sm">
            {qrToken}
          </dd>
          <dd className="mt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => void copyText(qrToken, "token")}>
              {copied === "token" ? (
                <>
                  <Check className="mr-2 size-4 text-slate-600" aria-hidden />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="mr-2 size-4" aria-hidden />
                  Copiar
                </>
              )}
            </Button>
          </dd>
        </div>
      </dl>
    </section>
  );
}
