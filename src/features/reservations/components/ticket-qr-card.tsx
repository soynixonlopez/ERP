"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type TicketQrCardProps = {
  qrToken: string;
  fileSlug: string;
  attendeeName: string;
  /** Si la reserva aún no está pagada/confirmada, no mostramos QR completo. */
  showQr: boolean;
};

export function TicketQrCard({
  qrToken,
  fileSlug,
  attendeeName,
  showQr
}: TicketQrCardProps): JSX.Element {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!showQr) {
      setDataUrl("");
      return;
    }
    void QRCode.toDataURL(qrToken, { width: 240, margin: 2, color: { dark: "#0b4fa6", light: "#ffffff" } }).then(
      setDataUrl
    );
  }, [qrToken, showQr]);

  if (!showQr) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        El código QR de tu entrada estará disponible cuando el pago quede confirmado.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Entrada digital</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{attendeeName}</p>
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`Código QR de entrada para ${attendeeName}`}
          className="mx-auto mt-3 h-52 w-52 object-contain"
        />
      ) : (
        <p className="mt-4 text-center text-sm text-slate-500">Generando QR…</p>
      )}
      <p className="mt-2 break-all text-center font-mono text-[10px] text-slate-500">{qrToken}</p>
      <p className="mt-2 text-center text-xs text-slate-600">
        Presenta este código en el acceso. Es único para validar tu entrada.
      </p>
      <Button
        type="button"
        variant="secondary"
        className="mt-3 w-full"
        disabled={!dataUrl}
        onClick={() => {
          if (!dataUrl) return;
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = `entrada-${fileSlug}.png`;
          a.click();
        }}
      >
        <Download className="mr-2 size-4" />
        Descargar entrada (PNG)
      </Button>
    </div>
  );
}
