import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InviteTicketArticle } from "@/features/invites/components/invite-ticket-article";
import { MyReservationEntry } from "@/features/reservations/components/my-reservation-ticket-panel";
import { getAppBaseUrl } from "@/lib/config/manual-payments";
import {
  inviteTicketDataFromReservationAndAttendee,
  type ReservationEmbedForTicket
} from "@/lib/invites/get-invite-ticket-data";
import { packageLabelFromItems, type ReservationItemForLabel } from "@/lib/reservations/package-label";

export const dynamic = "force-dynamic";

type AttendeeEmbed = {
  id: string;
  qr_code: string | null;
  full_name: string;
  email: string | null;
};

type ReservationWithRelations = {
  id: string;
  reservation_number: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  events: { title: string; starts_at?: string; location?: string } | { title: string }[] | null;
  reservation_items: ReservationItemForLabel[] | null;
  attendees: AttendeeEmbed[] | null;
};

function getEventTitle(events: ReservationWithRelations["events"]): string {
  if (!events) return "Evento";
  if (Array.isArray(events)) return events[0]?.title ?? "Evento";
  return events.title;
}

function slugForFile(reservationNumber: string): string {
  return reservationNumber.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "reserva";
}

function toReservationEmbed(row: ReservationWithRelations): ReservationEmbedForTicket {
  return {
    reservation_number: row.reservation_number,
    status: row.status,
    payment_status: row.payment_status,
    total: row.total,
    events: row.events as ReservationEmbedForTicket["events"],
    reservation_items: row.reservation_items as ReservationEmbedForTicket["reservation_items"]
  };
}

export default async function MyReservationsPage(): Promise<JSX.Element> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("reservations")
    .select(
      `
      id,
      reservation_number,
      status,
      payment_status,
      total,
      created_at,
      events ( title, starts_at, location ),
      reservation_items (
        quantity,
        unit_price,
        line_total,
        ticket_types ( name, price, badge_label )
      ),
      attendees ( id, qr_code, full_name, email )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <section className="mx-auto w-full max-w-3xl space-y-4">
        <p className="text-sm text-red-600">
          No se pudieron cargar las reservas. Verifica que la base de datos tenga las políticas actualizadas.
        </p>
      </section>
    );
  }

  const rows = (data ?? []) as unknown as ReservationWithRelations[];
  const baseUrl = getAppBaseUrl();

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="relative inline-block">
        <h1 className="text-4xl font-black tracking-tight text-[var(--epr-blue-800)]">Mis reservas</h1>
        <div className="mt-1 h-1 w-24 bg-[var(--accent)]" />
      </div>
      <p className="text-sm text-slate-600">
        Listado de tus compras. Cuando el administrador confirme el pago, veras aqui el mismo ticket digital que en la
        entrada del evento: puedes imprimirlo, descargar el QR o guardarlo como PDF desde el navegador.
      </p>

      {rows.length ? (
        <>
          <p className="text-sm font-semibold text-slate-800">
            {rows.length === 1 ? "1 reserva" : `${rows.length} reservas`} en tu cuenta
          </p>
          <ol className="grid list-none gap-8 p-0">
            {rows.map((reservation, index) => {
              const eventTitle = getEventTitle(reservation.events);
              const packageLabel = packageLabelFromItems(reservation.reservation_items);
              const showQr =
                reservation.status === "confirmed" && reservation.payment_status === "paid";
              const firstWithQr = reservation.attendees?.find((a) => a.qr_code);
              const firstAttendee = firstWithQr ?? reservation.attendees?.[0];
              const ticketData =
                firstAttendee?.qr_code && firstAttendee.full_name
                  ? inviteTicketDataFromReservationAndAttendee(toReservationEmbed(reservation), {
                      full_name: firstAttendee.full_name,
                      email: firstAttendee.email,
                      qr_code: firstAttendee.qr_code
                    })
                  : null;
              const inviteUrl = ticketData ? `${baseUrl}/invite/${ticketData.qrToken}` : "";

              const summary = (
                <>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                    #{index + 1}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--epr-blue-800)]">{eventTitle}</p>
                    <p className="text-base font-bold text-slate-900">{reservation.reservation_number}</p>
                    <p className="text-xs text-slate-500">
                      Estado: {reservation.status} · Pago: {reservation.payment_status}
                    </p>
                    <p className="text-xs text-slate-600">
                      Paquete: <span className="font-medium text-slate-800">{packageLabel}</span>
                    </p>
                    <p className="text-base font-semibold text-slate-800">
                      Total: ${Number(reservation.total).toFixed(2)}
                    </p>
                  </div>
                </>
              );

              return (
                <li key={reservation.id}>
                  <Card className="rounded-2xl print:border-0 print:shadow-none">
                    <CardContent className="space-y-4 p-5">
                      {ticketData ? (
                        <MyReservationEntry
                          summary={summary}
                          reservationNumber={reservation.reservation_number}
                          paymentApproved={showQr}
                          inviteUrl={inviteUrl}
                        >
                          <InviteTicketArticle
                            data={ticketData}
                            invitationUrl={inviteUrl}
                            fileSlug={slugForFile(reservation.reservation_number)}
                            articleId={`ticket-${reservation.id}`}
                          />
                        </MyReservationEntry>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4 print:hidden">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">{summary}</div>
                            <div className="flex flex-col gap-2 sm:items-end">
                              {showQr ? (
                                <span className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 text-sm font-semibold text-emerald-800">
                                  Pago aprobado
                                </span>
                              ) : (
                                <Link
                                  href={`/checkout/confirmation?reservation=${encodeURIComponent(reservation.reservation_number)}`}
                                >
                                  <Button variant="secondary" size="sm">
                                    Ver instrucciones de pago
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600">
                            Tu codigo de entrada se generara cuando el administrador confirme el pago. Si ya pagaste y
                            pasan las horas sin cambios, contacta al equipo con tu numero de reserva.
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ol>
        </>
      ) : (
        <p className="text-sm text-slate-600">Todavía no tienes reservas registradas.</p>
      )}
    </section>
  );
}
