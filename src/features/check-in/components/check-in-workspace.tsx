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
    id?: string;
    fullName?: string;
    email?: string | null;
    reservationNumber?: string;
    packageName?: string;
  };
  partyNames?: string[];
  buyerCountry?: string | null;
  buyerAge?: number | null;
};

type SummaryRecent = {
  checkedInAt: string;
  fullName: string;
  email: string | null;
  reservationNumber: string;
};

type AttendanceRow = SummaryRecent & { partyLabel?: string };

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

function localISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parsePartyNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

export function CheckInWorkspace({ organizationId, events }: CheckInWorkspaceProps): JSX.Element {
  const [eventId, setEventId] = useState<string>(events[0]?.id ?? "");
  /** Vacío = todo el historial del evento; YYYY-MM-DD = solo ese día (interpretación en UTC en servidor). */
  const [controlDate, setControlDate] = useState("");
  const [manual, setManual] = useState("");
  const [cameraOff, setCameraOff] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [recent, setRecent] = useState<SummaryRecent[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceTruncated, setAttendanceTruncated] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [preview, setPreview] = useState<ScanApiRow | null>(null);
  const [pendingRaw, setPendingRaw] = useState<string | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const lastScanRef = useRef<{ token: string; ts: number }>({ token: "", ts: 0 });
  const queueRef = useRef<string[]>([]);
  const drainRef = useRef(false);

  const dateQuery = controlDate.trim() ? `&controlDateUtc=${encodeURIComponent(controlDate.trim())}` : "";

  const pushFeed = useCallback((item: Omit<FeedItem, "id" | "at">) => {
    const id = crypto.randomUUID();
    setFeed((prev) => [{ id, at: Date.now(), ...item }, ...prev].slice(0, 40));
  }, []);

  const refreshSummary = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await fetch(
        `/api/admin/checkin/summary?organizationId=${encodeURIComponent(organizationId)}&eventId=${encodeURIComponent(eventId)}${dateQuery}`,
        { credentials: "same-origin" }
      );
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number; recent?: SummaryRecent[] };
      if (typeof data.count === "number") setCount(data.count);
      if (Array.isArray(data.recent)) setRecent(data.recent);
    } catch {
      /* ignorar */
    }
  }, [eventId, organizationId, dateQuery]);

  const loadAttendanceList = useCallback(async () => {
    if (!eventId) return;
    setAttendanceLoading(true);
    try {
      const res = await fetch(
        `/api/admin/checkin/attendance?organizationId=${encodeURIComponent(organizationId)}&eventId=${encodeURIComponent(eventId)}&limit=2000${dateQuery}`,
        { credentials: "same-origin" }
      );
      if (!res.ok) return;
      const data = (await res.json()) as { attendance?: AttendanceRow[]; truncated?: boolean };
      if (Array.isArray(data.attendance)) setAttendance(data.attendance);
      setAttendanceTruncated(Boolean(data.truncated));
    } catch {
      /* ignorar */
    } finally {
      setAttendanceLoading(false);
    }
  }, [eventId, organizationId, dateQuery]);

  useEffect(() => {
    void refreshSummary();
    void loadAttendanceList();
    const t = setInterval(() => void refreshSummary(), 4500);
    return () => clearInterval(t);
  }, [refreshSummary, loadAttendanceList]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setPreview(null);
    setPendingRaw(null);
  }, []);

  const runConfirmCheckin = useCallback(async () => {
    if (!eventId || !pendingRaw?.trim()) return;
    setConfirmBusy(true);
    try {
      const res = await fetch("/api/admin/checkin/scan", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, eventId, raw: pendingRaw })
      });
      const bodyUnknown = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        const msg = typeof bodyUnknown.error === "string" ? bodyUnknown.error : res.statusText;
        pushFeed({ kind: "error", title: "No se pudo registrar", detail: msg });
        closeModal();
        return;
      }
      const body = bodyUnknown as ScanApiRow;
      const name = body.attendee?.fullName ?? "Asistente";
      if (body.ok && body.code === "CHECKED_IN") {
        pushFeed({
          kind: "success",
          title: `Ingreso: ${name}`,
          detail: `${body.attendee?.packageName ?? ""} · ${body.attendee?.reservationNumber ?? ""}`.trim()
        });
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(30);
      } else if (body.ok && body.code === "ALREADY_CHECKED_IN") {
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
      void loadAttendanceList();
      closeModal();
    } finally {
      setConfirmBusy(false);
    }
  }, [
    eventId,
    pendingRaw,
    organizationId,
    pushFeed,
    refreshSummary,
    loadAttendanceList,
    closeModal
  ]);

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
        const res = await fetch("/api/admin/checkin/preview", {
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
        const partyNames = parsePartyNames(body.partyNames);

        if (
          code === "READY_TO_CHECK_IN" ||
          code === "ALREADY_CHECKED_IN" ||
          code === "NOT_CONFIRMED"
        ) {
          setPreview({ ...body, partyNames });
          setPendingRaw(raw);
          setModalOpen(true);
          return;
        }

        if (!body.ok) {
          pushFeed({
            kind: "error",
            title: body.message ?? "No valido",
            detail: undefined
          });
          return;
        }
      } finally {
        setBusy(false);
      }
    },
    [eventId, organizationId, pushFeed]
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

  const exportAttendanceCsv = useCallback(() => {
    if (!selected || attendance.length === 0) return;
    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
    const header = ["Nombre", "Correo", "Reserva", "Grupo", "Ingreso"].join(",");
    const lines = attendance.map((r) =>
      [
        esc(r.fullName),
        esc(r.email ?? ""),
        esc(r.reservationNumber),
        esc(r.partyLabel ?? ""),
        esc(formatEventDate(r.checkedInAt))
      ].join(",")
    );
    const bom = "\uFEFF";
    const safeName = selected.title.replace(/[^\w\s-]+/g, "").trim().slice(0, 48) || "evento";
    const blob = new Blob([bom + [header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asistencia-${safeName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [attendance, selected]);

  const resetControl = useCallback(async () => {
    if (!eventId) return;
    const label = controlDate.trim()
      ? `los ingresos del ${controlDate.trim()} (UTC)`
      : "todos los ingresos de este evento";
    if (!window.confirm(`¿Reiniciar control? Se eliminarán ${label}. Esta acción no se puede deshacer.`)) {
      return;
    }
    setResetBusy(true);
    try {
      const res = await fetch("/api/admin/checkin/reset", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          eventId,
          ...(controlDate.trim() ? { controlDateUtc: controlDate.trim() } : {})
        })
      });
      const j = (await res.json()) as { error?: string; deleted?: number };
      if (!res.ok) {
        pushFeed({ kind: "error", title: "No se pudo reiniciar", detail: j.error });
        return;
      }
      pushFeed({
        kind: "success",
        title: "Control reiniciado",
        detail: `Registros eliminados: ${typeof j.deleted === "number" ? j.deleted : "—"}`
      });
      void refreshSummary();
      void loadAttendanceList();
    } finally {
      setResetBusy(false);
    }
  }, [eventId, organizationId, controlDate, pushFeed, refreshSummary, loadAttendanceList]);

  const modalParty = preview?.partyNames?.length ? preview.partyNames : [];

  if (!events.length) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        No hay eventos configurados en Supabase para esta organizacion. Crea el evento en base de datos antes de usar
        control de acceso.
      </p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-start xl:gap-6">
      {modalOpen && preview ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 p-0 sm:items-center sm:p-4"
          role="presentation"
          onClick={closeModal}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkin-modal-title"
            className="max-h-[min(92vh,720px)] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
              <h2 id="checkin-modal-title" className="text-lg font-black text-slate-900">
                {preview.code === "READY_TO_CHECK_IN"
                  ? "Entrada válida"
                  : preview.code === "ALREADY_CHECKED_IN"
                    ? "Ya registró ingreso"
                    : preview.code === "NOT_CONFIRMED"
                      ? "Reserva no lista"
                      : "Detalle"}
              </h2>
              <p className="mt-1 text-xs text-slate-600">{preview.message}</p>
            </div>
            <div className="space-y-4 px-5 py-4 text-sm text-slate-800">
              {preview.attendee ? (
                <dl className="grid gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-[10px] font-bold uppercase text-slate-500">Persona (esta entrada)</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{preview.attendee.fullName ?? "—"}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-[10px] font-bold uppercase text-slate-500">Correo</dt>
                    <dd className="mt-1 break-words text-slate-800">{preview.attendee.email ?? "—"}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-[10px] font-bold uppercase text-slate-500">Reserva</dt>
                    <dd className="mt-1 font-mono text-slate-900">{preview.attendee.reservationNumber ?? "—"}</dd>
                  </div>
                  {preview.attendee.packageName ? (
                    <div className="rounded-xl bg-slate-50 p-3">
                      <dt className="text-[10px] font-bold uppercase text-slate-500">Paquete</dt>
                      <dd className="mt-1 font-medium text-slate-900">{preview.attendee.packageName}</dd>
                    </div>
                  ) : null}
                  {modalParty.length > 1 ? (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/90 p-3">
                      <dt className="text-[10px] font-bold uppercase text-indigo-800">Grupo en la reserva</dt>
                      <dd className="mt-2 flex flex-wrap gap-2">
                        {modalParty.map((n, i) => (
                          <span
                            key={`${n}-${i}`}
                            className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-indigo-950 shadow-sm ring-1 ring-indigo-100"
                          >
                            {n}
                          </span>
                        ))}
                      </dd>
                    </div>
                  ) : null}
                  {(preview.buyerCountry || preview.buyerAge != null) && (
                    <div className="rounded-xl bg-slate-50 p-3">
                      <dt className="text-[10px] font-bold uppercase text-slate-500">Comprador</dt>
                      <dd className="mt-1 text-slate-800">
                        {preview.buyerCountry ? <span className="font-medium">{preview.buyerCountry}</span> : null}
                        {preview.buyerCountry && preview.buyerAge != null ? " · " : null}
                        {preview.buyerAge != null ? (
                          <span className="tabular-nums font-medium">{preview.buyerAge} años</span>
                        ) : null}
                      </dd>
                    </div>
                  )}
                  {preview.code === "ALREADY_CHECKED_IN" && preview.checkedInAt ? (
                    <p className="text-xs text-amber-900">
                      Ingreso previo: <strong>{formatEventDate(preview.checkedInAt)}</strong>
                    </p>
                  ) : null}
                </dl>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={closeModal} disabled={confirmBusy}>
                Cerrar
              </Button>
              {preview.code === "READY_TO_CHECK_IN" ? (
                <Button type="button" variant="accent" onClick={() => void runConfirmCheckin()} disabled={confirmBusy}>
                  {confirmBusy ? "Registrando…" : "Registrar en lista de asistencia"}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="min-w-0 flex-1 space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-800" htmlFor="checkin-event">
                  Evento activo
                </label>
                <p className="mt-0.5 text-xs text-slate-500">
                  Todas las validaciones y el listado corresponden al evento elegido.
                </p>
                <select
                  id="checkin-event"
                  className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm"
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
                    Catalogo: <span className="font-medium text-slate-700">{selected.status}</span> · solo reservas
                    confirmadas y pagadas.
                  </p>
                ) : null}
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4">
                <label className="text-sm font-semibold text-slate-800" htmlFor="checkin-date">
                  Fecha del control (filtro)
                </label>
                <p className="mt-0.5 text-xs text-slate-500">
                  Deje vacío para ver todo el historial del evento. La fecha se compara en UTC (mismo criterio que el
                  reinicio parcial).
                </p>
                <div className="mt-2 flex flex-wrap items-end gap-2">
                  <Input
                    id="checkin-date"
                    type="date"
                    className="h-11 w-full max-w-[200px]"
                    value={controlDate}
                    onChange={(e) => setControlDate(e.target.value)}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={() => setControlDate("")}>
                    Ver todo
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setControlDate(localISODate())}>
                    Hoy
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!eventId || resetBusy}
                  onClick={() => void resetControl()}
                >
                  {resetBusy ? "Reiniciando…" : "Reiniciar control"}
                </Button>
              </div>
            </div>
            <div className="flex shrink-0 flex-col justify-center rounded-xl border border-slate-100 bg-slate-50 px-5 py-3 text-center sm:min-w-[9rem] sm:text-left">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Personas dentro</p>
              <p className="text-4xl font-black tabular-nums leading-none text-slate-900 sm:text-5xl">
                {count ?? "—"}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">Sincroniza cada pocos seg.</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5">
            <h2 className="text-base font-bold text-slate-900">Validar entrada</h2>
            <p className="mt-0.5 text-xs text-slate-600">
              Tras leer el código se muestra una vista previa; confirme para registrar el ingreso (un QR = un solo uso).
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-800">Camara (QR)</h3>
              <Button type="button" variant="secondary" size="sm" onClick={() => setCameraOff((v) => !v)}>
                {cameraOff ? "Activar camara" : "Pausar camara"}
              </Button>
            </div>
            <div className="mt-3">
              {!cameraOff ? (
                <GateQrScanner onScanText={onCameraScan} disabled={!eventId} />
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
                  Camara pausada. Active de nuevo para escanear.
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-slate-800">Entrada manual</h3>
            <p className="mt-1 text-xs text-slate-600">
              URL del ticket, UUID del QR o <strong>6 ultimos digitos</strong> del numero de reserva (o el numero
              completo).
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
                placeholder="URL, UUID o digitos de reserva"
                className="min-w-0 flex-1 font-mono text-xs sm:text-sm"
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
                  <>Formato reconocido. Intro o Validar.</>
                ) : (
                  <>No se detecta URL/UUID ni sufijo de reserva.</>
                )
              ) : (
                <>Intro envia igual que Validar.</>
              )}
            </p>
          </div>
        </div>

        <details
          className="group rounded-2xl border border-slate-200 bg-white shadow-sm open:shadow-md"
          open
        >
          <summary className="cursor-pointer list-none rounded-2xl px-4 py-3 sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-base font-bold text-slate-900">Lista de asistencia</span>
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({attendanceLoading ? "…" : attendance.length} personas)
                </span>
              </div>
              <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!eventId || attendanceLoading}
                  onClick={() => void loadAttendanceList()}
                >
                  {attendanceLoading ? "Cargando…" : "Actualizar"}
                </Button>
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  disabled={!eventId || attendance.length === 0}
                  onClick={exportAttendanceCsv}
                >
                  CSV
                </Button>
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500 group-open:hidden">
              Pulse para ver u ocultar la tabla completa (orden: ingreso mas reciente primero).
            </p>
          </summary>
          <div className="border-t border-slate-100 px-2 pb-3 sm:px-4">
            {attendanceTruncated ? (
              <p className="px-2 py-2 text-xs text-amber-800">
                Listado limitado a 2000 filas. Use CSV para el total si hace falta.
              </p>
            ) : null}
            <div className="max-h-[min(420px,55vh)] overflow-auto rounded-lg border border-slate-200 [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
                <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Nombre</th>
                    <th className="px-3 py-2 font-semibold">Correo</th>
                    <th className="px-3 py-2 font-semibold">Reserva</th>
                    <th className="px-3 py-2 font-semibold">Grupo</th>
                    <th className="whitespace-nowrap px-3 py-2 font-semibold">Ingreso</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                        {attendanceLoading ? "Cargando…" : "Sin ingresos aun para este evento."}
                      </td>
                    </tr>
                  ) : (
                    attendance.map((r, i) => (
                      <tr key={`${r.reservationNumber}-${r.checkedInAt}-${i}`} className="border-b border-slate-100">
                        <td className="px-3 py-2 font-medium text-slate-900">{r.fullName}</td>
                        <td className="px-3 py-2 text-slate-600 break-words">{r.email ?? "—"}</td>
                        <td className="px-3 py-2 font-mono text-slate-800">{r.reservationNumber}</td>
                        <td className="max-w-[200px] px-3 py-2 text-slate-600 break-words text-xs">
                          {r.partyLabel || "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-600">{formatEventDate(r.checkedInAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      </div>

      <aside className="flex w-full min-w-0 shrink-0 flex-col gap-4 xl:w-[300px] xl:max-w-[320px]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Actividad (esta pestana)</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Resultado de cada escaneo o validacion manual en este dispositivo.
          </p>
          <ul className="mt-3 max-h-[min(280px,40vh)] space-y-2 overflow-y-auto text-sm xl:max-h-[min(360px,50vh)]">
            {feed.length === 0 ? (
              <li className="text-slate-500">Aun sin lecturas aqui.</li>
            ) : (
              feed.map((f) => (
                <li
                  key={f.id}
                  className={`rounded-lg border px-3 py-2 ${
                    f.kind === "success"
                      ? "border-emerald-200 bg-white text-emerald-900"
                      : f.kind === "warn"
                        ? "border-amber-200 bg-white text-amber-950"
                        : "border-red-200 bg-white text-red-900"
                  }`}
                >
                  <p className="font-semibold leading-snug">{f.title}</p>
                  {f.detail ? <p className="text-xs opacity-90">{f.detail}</p> : null}
                </li>
              ))
            )}
          </ul>
        </div>

        {recent.length > 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Vista rapida (ultimos del servidor)</p>
            <ul className="mt-2 space-y-2">
              {recent.slice(0, 5).map((r, i) => (
                <li key={`${r.checkedInAt}-${i}`} className="border-b border-slate-100 pb-2 last:border-0">
                  <span className="font-medium text-slate-900">{r.fullName}</span>
                  <span className="text-slate-400"> · {r.reservationNumber}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10px] text-slate-400">La tabla completa esta arriba en Lista de asistencia.</p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
