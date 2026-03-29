"use client";

import { useEffect, useId, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

type GateQrScannerProps = {
  /** Se llama en cada lectura exitosa (deduplicar en el padre). */
  onScanText: (text: string) => void;
  disabled?: boolean;
};

/**
 * Camara para leer QR en puerta. Usa ref estable para no reiniciar la camara en cada render.
 */
export function GateQrScanner({ onScanText, disabled }: GateQrScannerProps): JSX.Element {
  const reactId = useId();
  const regionId = `gate-qr-${reactId.replace(/:/g, "")}`;
  const handlerRef = useRef(onScanText);
  handlerRef.current = onScanText;

  useEffect(() => {
    if (disabled) return;

    const html5 = new Html5Qrcode(regionId, /* verbose */ false);
    let cancelled = false;

    async function releaseScanner() {
      try {
        // stop() lanza un string de forma síncrona si no hay escaneo; .catch() en la promesa no lo atrapa.
        await html5.stop();
      } catch {
        /* ignorar */
      }
      try {
        await html5.clear();
      } catch {
        /* sin DOM de video */
      }
    }

    const run = async () => {
      try {
        try {
          await html5.start(
            { facingMode: "environment" },
            { fps: 8, qrbox: { width: 280, height: 280 } },
            (decoded) => {
              if (!cancelled) handlerRef.current(decoded);
            },
            () => {}
          );
        } catch {
          const cams = await Html5Qrcode.getCameras();
          const first = cams[0];
          if (!first?.id || cancelled) return;
          await html5.start(
            { deviceId: { exact: first.id } },
            { fps: 8, qrbox: { width: 280, height: 280 } },
            (decoded) => {
              if (!cancelled) handlerRef.current(decoded);
            },
            () => {}
          );
        }
      } catch {
        /* sin camara */
        return;
      }
      if (cancelled) {
        await releaseScanner();
      }
    };

    void run();

    return () => {
      cancelled = true;
      void releaseScanner();
    };
  }, [disabled, regionId]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-black/5">
      <div id={regionId} className="min-h-[280px] w-full [&_video]:mx-auto [&_video]:rounded-lg" />
      {disabled ? (
        <p className="p-3 text-center text-xs text-slate-500">Camara desactivada</p>
      ) : (
        <p className="p-2 text-center text-[10px] text-slate-500">
          Apunta al codigo del ticket. Funciona con varios lectores a la vez; la base de datos evita dobles ingresos.
        </p>
      )}
    </div>
  );
}
