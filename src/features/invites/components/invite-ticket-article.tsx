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
      className="ticket-print-article mx-auto w-full max-w-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-lg print:border print:border-slate-300 print:shadow-none"
    >
      <div className="relative bg-gradient-to-r from-[var(--epr-blue-800)] to-[var(--primary)] px-3 py-3 text-white sm:px-5 sm:py-4 print:bg-[var(--epr-blue-800)] print:px-4 print:py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
            <Image
              src="/assets/imagenes/LogoHorizontalColor.png"
              alt="EPR S.A."
              width={220}
              height={56}
              className="h-9 w-auto max-w-[min(100%,200px)] shrink-0 object-contain object-left rounded-lg bg-white/95 px-1.5 py-1 shadow-sm sm:h-11 sm:max-w-[min(100%,220px)] sm:px-2 print:h-8 print:max-w-[140px]"
              unoptimized
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/90">Entrada digital</p>
              <h2 className="text-base font-black leading-tight break-words sm:text-lg md:text-xl print:text-sm">
                {data.eventTitle}
              </h2>
            </div>
          </div>
          <div className="min-w-0 shrink-0 border-t border-white/20 pt-2 text-left sm:border-t-0 sm:pt-0 sm:text-right">
            <p
              className="font-mono text-xs font-bold tracking-wide break-all sm:text-sm md:text-base print:text-[11px]"
              title="Referencia de reserva"
            >
              {data.reservationNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 md:grid-cols-2 md:items-start md:gap-6 lg:gap-8 lg:p-6 print:grid-cols-2 print:gap-3 print:p-3">
        <div className="min-w-0 space-y-5">
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
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Titular de esta entrada</dt>
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
            {data.groupAttendeeNames.length > 1 ? (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 p-3 sm:col-span-2">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-indigo-800">Grupo en esta reserva</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {data.groupAttendeeNames.map((name, idx) => (
                    <span
                      key={`${name}-${idx}`}
                      className="inline-flex rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-indigo-950 shadow-sm ring-1 ring-indigo-100"
                    >
                      {name}
                    </span>
                  ))}
                </dd>
              </div>
            ) : null}
            {data.buyerCountry || data.buyerAge != null ? (
              <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Datos del comprador</dt>
                <dd className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-slate-800">
                  {data.buyerCountry ? (
                    <span>
                      <span className="text-slate-500">País:</span>{" "}
                      <span className="font-semibold">{data.buyerCountry}</span>
                    </span>
                  ) : null}
                  {data.buyerAge != null ? (
                    <span>
                      <span className="text-slate-500">Edad:</span>{" "}
                      <span className="font-semibold tabular-nums">{data.buyerAge} años</span>
                    </span>
                  ) : null}
                </dd>
              </div>
            ) : null}
            <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Evento</dt>
              <dd className="mt-1 font-semibold text-slate-900">{data.eventTitle}</dd>
              {data.eventStartsAt ? (
                <p className="mt-1 text-slate-600">{formatEventDate(data.eventStartsAt)}</p>
              ) : null}
              {data.eventLocation ? <p className="mt-0.5 text-slate-600">{data.eventLocation}</p> : null}
            </div>
          </dl>
        </div>

        <div className="flex flex-col items-center justify-center md:items-end print:items-center print:justify-start">
          <InviteTicketQr inviteUrl={invitationUrl} fileSlug={fileSlug} />
        </div>

        <div className="min-w-0 md:col-span-2 print:col-span-2">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Paquete y montos</h3>
          <div className="w-full rounded-xl border border-slate-200">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="w-[46%] px-2 py-2 sm:w-[48%] sm:px-3">Paquete</th>
                  <th className="w-[12%] px-1 py-2 text-right sm:px-3">Cant.</th>
                  <th className="w-[21%] px-1 py-2 text-right sm:px-3">P. unit.</th>
                  <th className="w-[21%] px-1 py-2 text-right sm:px-3">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.lines.length ? (
                  data.lines.map((line, i) => (
                    <tr key={i}>
                      <td className="min-w-0 break-words px-2 py-2 align-top text-sm font-medium text-slate-900 sm:px-3 sm:py-2.5 sm:text-base">
                        {line.packageName}
                        {line.badgeLabel ? (
                          <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 sm:ml-2 sm:mt-0">
                            {line.badgeLabel}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-1 py-2.5 text-right tabular-nums text-slate-700 sm:px-3">{line.quantity}</td>
                      <td className="break-words px-1 py-2.5 text-right text-xs tabular-nums text-slate-700 sm:px-3 sm:text-sm">
                        ${line.unitPrice.toFixed(2)}
                      </td>
                      <td className="break-words px-1 py-2.5 text-right text-xs font-semibold tabular-nums text-slate-900 sm:px-3 sm:text-sm">
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
                  <td colSpan={3} className="px-2 py-2.5 text-right text-xs font-bold uppercase text-slate-600 sm:px-3">
                    Total USD
                  </td>
                  <td className="px-1 py-2.5 text-right text-base font-black tabular-nums text-slate-900 sm:px-3">
                    ${data.total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div className="border-t border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-[10px] text-slate-600 sm:px-5 sm:py-3 print:bg-white print:py-2 print:text-[9px]">
        Documento emitido tras confirmación de pago. Consérvelo y preséntelo en el acceso al evento.
      </div>
    </article>
  );
}
