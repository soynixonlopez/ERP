"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

type InviteTicketQrProps = {
  /** URL completa a esta invitacion; el escaneo abre el ticket para validacion visual. */
  inviteUrl: string;
  /** Para nombre de archivo al descargar PNG */
  fileSlug: string;
  label?: string;
};

export function InviteTicketQr({
  inviteUrl,
  fileSlug,
  label = "Codigo QR de acceso"
}: InviteTicketQrProps): JSX.Element {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!inviteUrl) {
      setDataUrl("");
      return;
    }
    void QRCode.toDataURL(inviteUrl, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" }
    }).then(setDataUrl);
  }, [inviteUrl]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-4">
        <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="Codigo QR de entrada al evento"
            width={280}
            height={280}
            className="rounded-lg bg-white"
          />
        ) : (
          <div className="flex h-[280px] w-[280px] items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
            Generando QR…
          </div>
        )}
        <p className="mt-3 max-w-[280px] text-center text-[10px] leading-snug text-slate-500">
          Presenta este codigo en el acceso al evento. El personal puede escanearlo o verificar los datos en pantalla.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2 print:hidden">
        <Button type="button" variant="secondary" size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 size-4" />
          Imprimir entrada
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
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
          Descargar QR
        </Button>
      </div>
    </div>
  );
}
