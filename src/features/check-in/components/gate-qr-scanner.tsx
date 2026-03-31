"use client";

import { useEffect, useId, useRef, useState } from "react";

type Html5QrcodeModule = typeof import("html5-qrcode");
type Html5QrcodeClass = Html5QrcodeModule["Html5Qrcode"];

type GateQrScannerProps = {
  onScanText: (text: string) => void;
  disabled?: boolean;
};

async function stopScanner(s: InstanceType<Html5QrcodeClass> | null): Promise<void> {
  if (!s) return;
  try {
    await s.stop();
  } catch {
    /* ignorar */
  }
  try {
    await s.clear();
  } catch {
    /* ignorar */
  }
}

/** Pide permiso y libera el stream para que getCameras() liste bien en Chrome/Edge. */
async function warmUpCameraPermission(): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((t) => t.stop());
  } catch {
    /* permiso denegado o sin dispositivo: getCameras puede seguir vacio */
  }
}

function pickPreferredCameraId(
  cams: { id: string; label: string }[]
): { id: string } | null {
  if (!cams.length) return null;
  const back = cams.find((c) => /back|rear|trasera|wide|environment|ultra/i.test(c.label));
  return { id: (back ?? cams[0]).id };
}

/**
 * Camara para leer QR en puerta. Carga html5-qrcode solo en el cliente y elige camara por ID (mejor en portatiles que facingMode "environment").
 */
export function GateQrScanner({ onScanText, disabled }: GateQrScannerProps): JSX.Element {
  const reactId = useId();
  const regionId = `gate-qr-${reactId.replace(/:/g, "")}`;
  const handlerRef = useRef(onScanText);
  const scannerRef = useRef<InstanceType<Html5QrcodeClass> | null>(null);
  handlerRef.current = onScanText;
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    setCameraError(null);
    if (disabled) return;

    let cancelled = false;

    const run = async () => {
      await new Promise((r) => setTimeout(r, 80));
      if (cancelled) return;

      const el = document.getElementById(regionId);
      if (!el) {
        setCameraError("No se encontro el visor. Recargue la pagina.");
        return;
      }

      let Html5Qrcode: Html5QrcodeModule["Html5Qrcode"];
      try {
        ({ Html5Qrcode } = await import("html5-qrcode"));
      } catch {
        setCameraError("No se pudo cargar el escaner QR. Ejecute npm install y reinicie el servidor.");
        return;
      }

      if (cancelled) return;

      await warmUpCameraPermission();
      if (cancelled) return;

      const html5 = new Html5Qrcode(regionId, false);
      scannerRef.current = html5;

      const onDecoded = (decodedText: string) => {
        if (!cancelled) handlerRef.current(decodedText);
      };

      const config = {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.777777778
      } as const;

      const tryStart = async (cameraIdOrConfig: string | MediaTrackConstraints) => {
        await html5.start(cameraIdOrConfig, config, onDecoded, () => {});
      };

      try {
        const cams = await Html5Qrcode.getCameras();
        const picked = pickPreferredCameraId(cams);
        if (picked) {
          await tryStart(picked.id);
        } else {
          try {
            await tryStart({ facingMode: "user" });
          } catch {
            await tryStart({ facingMode: "environment" });
          }
        }
      } catch (e) {
        scannerRef.current = null;
        await stopScanner(html5);
        if (cancelled) return;
        const msg =
          e instanceof Error
            ? e.message
            : "No se pudo abrir la camara. Permita el acceso en la barra del navegador (icono de candado o camara).";
        setCameraError(msg);
        return;
      }

      if (cancelled) {
        await stopScanner(scannerRef.current);
        scannerRef.current = null;
      }
    };

    void run();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      scannerRef.current = null;
      void stopScanner(s);
    };
  }, [disabled, regionId]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-black/5">
      <div id={regionId} className="min-h-[280px] w-full [&_video]:mx-auto [&_video]:h-auto [&_video]:min-h-[200px] [&_video]:w-full [&_video]:max-w-full [&_video]:rounded-lg [&_video]:object-cover" />
      {disabled ? (
        <p className="p-3 text-center text-xs text-slate-500">Seleccione un evento para activar la camara.</p>
      ) : cameraError ? (
        <div className="border-t border-amber-200 bg-amber-50 p-3 text-center text-xs text-amber-950">
          <p>{cameraError}</p>
          <p className="mt-2 text-[10px] text-amber-900/90">
            En Chrome/Edge: clic en el icono junto a la URL y permita camara para este sitio.
          </p>
        </div>
      ) : (
        <p className="p-2 text-center text-[10px] text-slate-500">
          Apunta al codigo del ticket. Funciona con varios lectores a la vez; la base de datos evita dobles ingresos.
        </p>
      )}
    </div>
  );
}
