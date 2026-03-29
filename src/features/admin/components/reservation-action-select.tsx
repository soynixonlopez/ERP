"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ReservationAction = "approve" | "cancel" | "delete";

type ReservationActionSelectProps = {
  reservationId: string;
  organizationId: string;
  status: string;
  paymentStatus: string;
};

export function ReservationActionSelect({
  reservationId,
  organizationId,
  status,
  paymentStatus
}: ReservationActionSelectProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<ReservationAction>("approve");
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const router = useRouter();

  const paid = paymentStatus === "paid";
  const cancelled = status === "cancelled";

  const runAction = async () => {
    setFeedback(null);
    setLoading(true);
    try {
      if (action === "approve" && paid) {
        setFeedback({ kind: "err", text: "Esta reserva ya tiene el pago registrado." });
        return;
      }
      if (action === "cancel" && cancelled) {
        setFeedback({ kind: "err", text: "La reserva ya esta cancelada." });
        return;
      }

      let res: Response;
      if (action === "approve") {
        res = await fetch(`/api/admin/reservations/${reservationId}/approve`, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId })
        });
      } else if (action === "cancel") {
        res = await fetch(`/api/admin/reservations/${reservationId}`, {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId })
        });
      } else {
        const ok = window.confirm("Esta accion elimina la reserva. Deseas continuar?");
        if (!ok) return;
        res = await fetch(
          `/api/admin/reservations/${reservationId}?organizationId=${encodeURIComponent(organizationId)}`,
          { method: "DELETE", credentials: "same-origin" }
        );
      }

      const body = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setFeedback({
          kind: "err",
          text: body.error ?? `Error del servidor (${res.status}).`
        });
        return;
      }

      const msg =
        action === "approve"
          ? "Pago aprobado; la lista se actualizo."
          : action === "cancel"
            ? "Reserva cancelada; la lista se actualizo."
            : "Reserva eliminada; la lista se actualizo.";
      setFeedback({ kind: "ok", text: msg });
      router.refresh();
    } catch {
      setFeedback({ kind: "err", text: "No se pudo completar la accion. Revisa tu conexion." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-w-[260px] max-w-[min(100vw-2rem,420px)] flex-nowrap items-center gap-1.5"
      role="group"
      aria-label="Acciones de reserva"
    >
      <select
        value={action}
        onChange={(e) => {
          setAction(e.target.value as ReservationAction);
          setFeedback(null);
        }}
        className="h-9 w-[min(11rem,42vw)] shrink-0 rounded-lg border border-[var(--border)] bg-white px-2 text-sm"
        disabled={loading}
      >
        <option value="approve" disabled={paid}>
          Aprobar pago
        </option>
        <option value="cancel" disabled={cancelled}>
          Cancelar
        </option>
        <option value="delete">Eliminar</option>
      </select>
      <Button
        type="button"
        size="sm"
        className="h-9 shrink-0 px-3"
        variant={action === "approve" ? "accent" : "secondary"}
        onClick={runAction}
        disabled={loading || (action === "approve" && paid) || (action === "cancel" && cancelled)}
      >
        {loading ? "..." : "OK"}
      </Button>
      {feedback ? (
        <span
          className={`min-w-0 max-w-[12rem] truncate text-xs leading-tight sm:max-w-[14rem] ${feedback.kind === "ok" ? "text-emerald-700" : "text-red-600"}`}
          title={feedback.text}
          role="status"
        >
          {feedback.text}
        </span>
      ) : null}
    </div>
  );
}
