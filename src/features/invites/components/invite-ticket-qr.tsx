"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

type InviteTicketQrProps = {
  inviteUrl: string;
  fileSlug: string;
  label?: string;
};

function qrPixelSize(): number {
  if (typeof window === "undefined") return 240;
  const w = window.innerWidth;
  if (w < 400) return 180;
  if (w < 640) return 220;
  return 280;
}

export function InviteTicketQr({
  inviteUrl,
  fileSlug,
  label = "Codigo QR de acceso"
}: InviteTicketQrProps): JSX.Element {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [pixelSize, setPixelSize] = useState(240);

  useEffect(() => {
    const onResize = () => setPixelSize(qrPixelSize());
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!inviteUrl) {
      setDataUrl("");
      return;
    }
    void QRCode.toDataURL(inviteUrl, {
      width: pixelSize,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" }
    }).then(setDataUrl);
  }, [inviteUrl, pixelSize]);

  return (
    <div className="flex w-full max-w-[min(100%,320px)] flex-col items-center sm:max-w-none">
      <div className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-3 sm:p-4 print:border print:p-2">
        <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 print:mb-1">
          {label}
        </p>
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="Codigo QR de entrada al evento"
            width={pixelSize}
            height={pixelSize}
            className="h-auto max-h-[min(72vw,280px)] w-auto max-w-full rounded-lg bg-white print:max-h-[150px] print:max-w-[150px]"
          />
        ) : (
          <div
            className="flex aspect-square w-full max-w-[280px] items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500"
            style={{ maxHeight: "min(72vw, 280px)" }}
          >
            Generando QR…
          </div>
        )}
        <p className="mt-2 max-w-full text-center text-[10px] leading-snug text-slate-500 sm:mt-3 sm:max-w-[280px] print:hidden">
          Presenta este codigo en el acceso al evento. El personal puede escanearlo o verificar los datos en pantalla.
        </p>
      </div>
      <div className="mt-3 flex w-full max-w-[min(100%,320px)] flex-wrap justify-center gap-2 print:hidden sm:mt-4">
        <Button type="button" variant="secondary" size="sm" className="min-h-11 flex-1 sm:flex-none" onClick={() => window.print()}>
          <Printer className="mr-2 size-4 shrink-0" />
          Imprimir entrada
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="min-h-11 flex-1 sm:flex-none"
          disabled={!dataUrl}
          onClick={() => {
            if (!dataUrl) return;
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `entrada-${fileSlug}.png`;
            a.click();
          }}
        >
          <Download className="mr-2 size-4 shrink-0" />
          Descargar QR
        </Button>
      </div>
    </div>
  );
}
