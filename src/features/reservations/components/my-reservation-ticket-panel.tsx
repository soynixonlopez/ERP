"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type MyReservationEntryProps = {
  /** Bloque izquierdo: datos de la reserva (servidor). */
  summary: React.ReactNode;
  reservationNumber: string;
  paymentApproved: boolean;
  inviteUrl: string | null;
  /** Ticket completo; solo se muestra tras pulsar Abrir ticket. */
  children: React.ReactNode;
};

export function MyReservationEntry({
  summary,
  reservationNumber,
  paymentApproved,
  inviteUrl,
  children
}: MyReservationEntryProps): JSX.Element {
  const [ticketOpen, setTicketOpen] = useState(false);

  return (
    <>
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4 print:hidden">
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">{summary}</div>
        <div className="flex flex-col gap-2 sm:items-end">
          {paymentApproved ? (
            <span className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 text-sm font-semibold text-emerald-800">
              Pago aprobado
            </span>
          ) : (
            <Link href={`/checkout/confirmation?reservation=${encodeURIComponent(reservationNumber)}`}>
              <Button variant="secondary" size="sm">
                Ver instrucciones de pago
              </Button>
            </Link>
          )}
          {inviteUrl ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => setTicketOpen((v) => !v)}>
              {ticketOpen ? "Ocultar ticket" : "Abrir ticket"}
            </Button>
          ) : null}
        </div>
      </div>

      {inviteUrl ? (
        <div
          className={cn(
            "space-y-3 pt-4 print:space-y-0 print:pt-0",
            !ticketOpen && "hidden print:block"
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 print:hidden">
            Tu entrada digital (mismo formato que valida el equipo en acceso)
          </p>
          {children}
          {!paymentApproved ? (
            <p className="text-xs text-amber-800 print:hidden">
              El pago aun no figura como confirmado en el sistema; conserva este enlace. Si ya pagaste, espera la
              validacion del administrador.
            </p>
          ) : null}
        </div>
      ) : null}

      {!inviteUrl ? (
        <p className="text-sm text-slate-600">
          Tu codigo de entrada se generara cuando el administrador confirme el pago. Si ya pagaste y pasan las horas sin
          cambios, contacta al equipo con tu numero de reserva.
        </p>
      ) : null}
    </>
  );
}
