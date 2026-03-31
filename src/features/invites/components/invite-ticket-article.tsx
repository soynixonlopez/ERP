import Image from "next/image";
import { InviteTicketQr } from "@/features/invites/components/invite-ticket-qr";
import type { InviteTicketData } from "@/lib/invites/get-invite-ticket-data";
import { reservationPaymentBadgeLine } from "@/lib/labels/reservation-status";
import { formatEventDate } from "@/lib/utils/date";

type InviteTicketArticleProps = {
  data: InviteTicketData;
  invitationUrl: string;
  fileSlug: string;
  /** Evita ids duplicados cuando hay varios tickets en la misma pagina. */
  articleId?: string;
};

export function InviteTicketArticle({
  data,
  invitationUrl,
  fileSlug,
  articleId = "invite-ticket"
}: InviteTicketArticleProps): JSX.Element {
  const paidOk = data.paymentStatus === "paid" && data.reservationStatus === "confirmed";

  return (
    <article
      id={articleId}
      className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-lg print:break-inside-avoid print:border-slate-300 print:shadow-none"
    >
      <div className="relative bg-gradient-to-r from-[var(--epr-blue-800)] to-[var(--primary)] px-5 py-4 text-white print:bg-[var(--epr-blue-800)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            <Image
              src="/assets/imagenes/LogoHorizontalColor.png"
              alt="EPR S.A."
              width={220}
              height={56}
              className="h-11 w-auto max-w-[min(100%,220px)] shrink-0 object-contain object-left rounded-lg bg-white/95 px-2 py-1 shadow-sm"
              unoptimized
            />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/90">Entrada digital</p>
              <h2 className="text-lg font-black leading-tight break-words sm:text-xl">{data.eventTitle}</h2>
            </div>
          </div>
          <div className="min-w-0 shrink-0 text-right font-medium text-white/95">
            <p
              className="max-w-[11rem] font-mono text-xs font-bold tracking-wide break-all text-right sm:max-w-none sm:text-base md:text-lg"
              title="Referencia de reserva"
            >
              {data.reservationNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-8 sm:p-6">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {paidOk ? (
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                Pago confirmado · Entrada valida
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                {reservationPaymentBadgeLine(data.reservationStatus, data.paymentStatus)}
              </span>
            )}
          </div>

          <dl className="grid gap-3 text-sm text-slate-800 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Titular</dt>
              <dd className="mt-1 font-semibold text-slate-900">{data.attendeeName}</dd>
            </div>
            <div className="min-w-0 rounded-xl bg-slate-50 p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Correo</dt>
              <dd
                className="mt-1 min-w-0 max-w-full text-[10px] font-medium leading-snug text-slate-800 break-words sm:text-xs md:text-sm"
                title={data.attendeeEmail ?? undefined}
              >
                {data.attendeeEmail ?? "—"}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Evento</dt>
              <dd className="mt-1 font-semibold text-slate-900">{data.eventTitle}</dd>
              {data.eventStartsAt ? (
                <p className="mt-1 text-slate-600">{formatEventDate(data.eventStartsAt)}</p>
              ) : null}
              {data.eventLocation ? <p className="mt-0.5 text-slate-600">{data.eventLocation}</p> : null}
            </div>
          </dl>

          <div>
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Paquete y montos</h3>
            <div className="min-w-0 overflow-x-auto rounded-xl border border-slate-200 [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[280px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Paquete</th>
                    <th className="px-3 py-2 text-right">Cant.</th>
                    <th className="px-3 py-2 text-right">P. unit.</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.lines.length ? (
                    data.lines.map((line, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2.5 font-medium text-slate-900">
                          {line.packageName}
                          {line.badgeLabel ? (
                            <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                              {line.badgeLabel}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{line.quantity}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">
                          ${line.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-slate-900">
                          ${line.lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-3 text-slate-600">
                        Detalle de lineas no disponible.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={3} className="px-3 py-2.5 text-right text-xs font-bold uppercase text-slate-600">
                      Total USD
                    </td>
                    <td className="px-3 py-2.5 text-right text-base font-black tabular-nums text-slate-900">
                      ${data.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center sm:items-end print:break-inside-avoid">
          <InviteTicketQr inviteUrl={invitationUrl} fileSlug={fileSlug} />
        </div>
      </div>

      <div className="border-t border-dashed border-slate-200 bg-slate-50 px-5 py-3 text-center text-[10px] text-slate-600 print:bg-white">
        Documento emitido tras confirmación de pago. Consérvelo y preséntelo en el acceso al evento.
      </div>
    </article>
  );
}
