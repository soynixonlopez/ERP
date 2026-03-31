"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GateQrScanner } from "@/features/check-in/components/gate-qr-scanner";
import { extractInviteTokenFromScan, isLikelyInviteUuid } from "@/lib/checkin/extract-qr-token";
import { parseReservationCheckInSuffix } from "@/lib/reservations/reservation-access-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEventDate } from "@/lib/utils/date";

export type CheckInEventOption = {
  id: string;
  title: string;
  starts_at: string | null;
  status: string;
};

type ScanApiRow = {
  ok: boolean;
  code?: string;
  message?: string;
  checkedInAt?: string;
  attendee?: {
    fullName?: string;
    email?: string | null;
    reservationNumber?: string;
    packageName?: string;
  };
};

type SummaryRecent = {
  checkedInAt: string;
  fullName: string;
  email: string | null;
  reservationNumber: string;
};

type FeedItem = {
  id: string;
  at: number;
  kind: "success" | "warn" | "error";
  title: string;
  detail?: string;
};

type CheckInWorkspaceProps = {
  organizationId: string;
  events: CheckInEventOption[];
};

export function CheckInWorkspace({ organizationId, events }: CheckInWorkspaceProps): JSX.Element {
  const [eventId, setEventId] = useState<string>(events[0]?.id ?? "");
  const [manual, setManual] = useState("");
  const [cameraOff, setCameraOff] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [recent, setRecent] = useState<SummaryRecent[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [busy, setBusy] = useState(false);

  const lastScanRef = useRef<{ token: string; ts: number }>({ token: "", ts: 0 });
  const queueRef = useRef<string[]>([]);
  const drainRef = useRef(false);

  const pushFeed = useCallback((item: Omit<FeedItem, "id" | "at">) => {
    const id = crypto.randomUUID();
    setFeed((prev) => [{ id, at: Date.now(), ...item }, ...prev].slice(0, 40));
  }, []);

  const refreshSummary = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await fetch(
        `/api/admin/checkin/summary?organizationId=${encodeURIComponent(organizationId)}&eventId=${encodeURIComponent(eventId)}`,
        { credentials: "same-origin" }
      );
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number; recent?: SummaryRecent[] };
      if (typeof data.count === "number") setCount(data.count);
      if (Array.isArray(data.recent)) setRecent(data.recent);
    } catch {
      /* ignorar errores de red en segundo plano */
    }
  }, [eventId, organizationId]);

  useEffect(() => {
    void refreshSummary();
    const t = setInterval(() => void refreshSummary(), 4500);
    return () => clearInterval(t);
  }, [refreshSummary]);

  const submitRaw = useCallback(
    async (raw: string) => {
      if (!eventId || !raw.trim()) return;

      const token = extractInviteTokenFromScan(raw);
      const suffix = token ? null : parseReservationCheckInSuffix(raw);
      const dedupeKey = token || suffix || raw.trim();
      const now = Date.now();
      if (dedupeKey && dedupeKey === lastScanRef.current.token && now - lastScanRef.current.ts < 1600) {
        return;
      }
      if (dedupeKey) lastScanRef.current = { token: dedupeKey, ts: now };

      setBusy(true);
      try {
        const res = await fetch("/api/admin/checkin/scan", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId, eventId, raw })
        });
        const bodyUnknown = (await res.json()) as Record<string, unknown>;

        if (!res.ok) {
          const msg = typeof bodyUnknown.error === "string" ? bodyUnknown.error : res.statusText;
          pushFeed({ kind: "error", title: "Error al validar", detail: msg });
          return;
        }

        const body = bodyUnknown as ScanApiRow;
        const code = body.code;
        const name = body.attendee?.fullName ?? "Asistente";

        if (body.ok && code === "CHECKED_IN") {
          pushFeed({
            kind: "success",
            title: `Ingreso: ${name}`,
            detail: `${body.attendee?.packageName ?? ""} · ${body.attendee?.reservationNumber ?? ""}`.trim()
          });
          if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(30);
        } else if (body.ok && code === "ALREADY_CHECKED_IN") {
          pushFeed({
            kind: "warn",
            title: `Ya ingreso: ${name}`,
            detail: body.checkedInAt ? formatEventDate(body.checkedInAt) : undefined
          });
        } else {
          pushFeed({
            kind: "error",
            title: body.message ?? "No valido",
            detail: name !== "Asistente" ? name : undefined
          });
        }

        void refreshSummary();
      } finally {
        setBusy(false);
      }
    },
    [eventId, organizationId, pushFeed, refreshSummary]
  );

  const drainQueue = useCallback(async () => {
    if (drainRef.current) return;
    drainRef.current = true;
    try {
      while (queueRef.current.length > 0) {
        const next = queueRef.current.shift();
        if (next) await submitRaw(next);
      }
    } finally {
      drainRef.current = false;
      if (queueRef.current.length > 0) void drainQueue();
    }
  }, [submitRaw]);

  const onCameraScan = useCallback(
    (text: string) => {
      queueRef.current.push(text);
      void drainQueue();
    },
    [drainQueue]
  );

  const selected = events.find((e) => e.id === eventId);

  const manualPreview = useMemo(() => extractInviteTokenFromScan(manual), [manual]);
  const manualSuffix = useMemo(() => parseReservationCheckInSuffix(manual), [manual]);
  const manualLooksValid =
    (Boolean(manualPreview) && (manual.includes("/invite/") || isLikelyInviteUuid(manualPreview))) ||
    Boolean(manualSuffix);

  const submitManual = useCallback(() => {
    const raw = manual.trim();
    if (!raw || busy || !eventId) return;
    void submitRaw(raw);
    setManual("");
  }, [manual, busy, eventId, submitRaw]);

  if (!events.length) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        No hay eventos configurados en Supabase para esta organizacion. Crea el evento en base de datos antes de usar
        control de acceso.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block text-sm font-semibold text-slate-800" htmlFor="checkin-event">
            Evento a controlar
          </label>
          <select
            id="checkin-event"
            className="mt-2 h-11 w-full max-w-md rounded-lg border border-[var(--border)] bg-white px-3 text-sm"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
                {e.starts_at ? ` · ${formatEventDate(e.starts_at)}` : ""}
              </option>
            ))}
          </select>
          {selected ? (
            <p className="mt-2 text-xs text-slate-500">
              Eventos registrados para la organización. Estado en catálogo:{" "}
              <span className="font-medium text-slate-700">{selected.status}</span>. Solo ingresan reservas confirmadas y
              pagadas.
            </p>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900">Escaner de camara</h2>
            <Button type="button" variant="secondary" size="sm" onClick={() => setCameraOff((v) => !v)}>
              {cameraOff ? "Activar camara" : "Pausar camara"}
            </Button>
          </div>
          {!cameraOff ? <GateQrScanner onScanText={onCameraScan} disabled={!eventId} /> : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Entrada manual</h2>
          <p className="mt-1 text-xs text-slate-600">
            Pegue la URL del ticket, el UUID del QR o los <strong>6 últimos números</strong> del número de reserva (también
            puede pegar el número completo). Se acepta texto adicional (p. ej. cuerpo de correo).
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <Input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitManual();
                }
              }}
              placeholder="URL, UUID o 6 dígitos de reserva"
              className="flex-1 font-mono text-xs sm:text-sm"
              disabled={busy || !eventId}
              autoComplete="off"
              spellCheck={false}
              aria-describedby="manual-checkin-hint"
            />
            <Button
              type="button"
              variant="accent"
              className="shrink-0 sm:min-w-[120px]"
              disabled={busy || !eventId || !manual.trim()}
              onClick={submitManual}
            >
              Validar
            </Button>
          </div>
          <p id="manual-checkin-hint" className="mt-2 text-[11px] leading-relaxed text-slate-500">
            {manual.trim() ? (
              manualLooksValid ? (
                <>Formato reconocido. Pulse Validar o Intro.</>
              ) : (
                <>No se detecta URL/UUID del ticket ni 6 dígitos de reserva; corrija e inténtelo de nuevo.</>
              )
            ) : (
              <>Pulse Intro para enviar con el mismo efecto que Validar.</>
            )}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-bold text-slate-900">Ultimas lecturas (esta sesion)</h2>
          <ul className="mt-2 max-h-72 space-y-2 overflow-y-auto text-sm">
            {feed.length === 0 ? (
              <li className="text-slate-500">Aun no hay lecturas en esta pestana.</li>
            ) : (
              feed.map((f) => (
                <li
                  key={f.id}
                  className={`rounded-lg border px-3 py-2 ${
                    f.kind === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : f.kind === "warn"
                        ? "border-amber-200 bg-amber-50 text-amber-950"
                        : "border-red-200 bg-red-50 text-red-900"
                  }`}
                >
                  <p className="font-semibold">{f.title}</p>
                  {f.detail ? <p className="text-xs opacity-90">{f.detail}</p> : null}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border-2 border-[var(--epr-blue-800)] bg-gradient-to-br from-slate-900 to-[var(--epr-blue-800)] p-5 text-white shadow-lg">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">Personas en el evento</p>
          <p className="mt-2 text-5xl font-black tabular-nums">{count ?? "—"}</p>
          <p className="mt-2 text-xs text-white/80">
            Conteo en vivo (varios dispositivos: se sincroniza cada pocos segundos).
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Ultimos ingresos</h2>
          <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto text-xs">
            {recent.length === 0 ? (
              <li className="text-slate-500">Sin datos aun.</li>
            ) : (
              recent.map((r, i) => (
                <li key={`${r.checkedInAt}-${i}`} className="border-b border-slate-100 pb-2 last:border-0">
                  <p className="font-semibold text-slate-900">{r.fullName}</p>
                  <p className="text-slate-500">{r.reservationNumber}</p>
                  <p className="text-slate-400">{formatEventDate(r.checkedInAt)}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
}
