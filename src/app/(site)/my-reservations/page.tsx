import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketQrCard } from "@/features/reservations/components/ticket-qr-card";

export const dynamic = "force-dynamic";

type AttendeeEmbed = { id: string; qr_code: string | null; full_name: string };

type ReservationWithRelations = {
  id: string;
  reservation_number: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  /** PostgREST puede devolver objeto o array de 1 elemento según la relación. */
  events: { title: string } | { title: string }[] | null;
  attendees: AttendeeEmbed[] | null;
};

function getEventTitle(events: ReservationWithRelations["events"]): string {
  if (!events) return "Evento";
  if (Array.isArray(events)) return events[0]?.title ?? "Evento";
  return events.title;
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
      events ( title ),
      attendees ( id, qr_code, full_name )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <section className="mx-auto w-full max-w-3xl space-y-4">
        <p className="text-sm text-red-600">
          No se pudieron cargar las reservas. Verifica que la base de datos tenga las políticas
          actualizadas (migración attendee_qr).
        </p>
      </section>
    );
  }

  const rows = (data ?? []) as unknown as ReservationWithRelations[];

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="relative inline-block">
        <h1 className="text-4xl font-black tracking-tight text-[var(--epr-blue-800)]">Mis reservas</h1>
        <div className="mt-1 h-1 w-24 bg-[var(--accent)]" />
      </div>
      <p className="text-sm text-slate-600">
        Aquí ves tus compras y, cuando el pago esté confirmado, tu entrada con código QR para el acceso.
      </p>

      {rows.length ? (
        <div className="grid gap-6">
          {rows.map((reservation) => {
            const eventTitle = getEventTitle(reservation.events);
            const showQr =
              reservation.status === "confirmed" && reservation.payment_status === "paid";
            const firstAttendee = reservation.attendees?.[0];

            return (
              <Card key={reservation.id} className="rounded-2xl">
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[var(--epr-blue-800)]">{eventTitle}</p>
                      <p className="text-base font-bold text-slate-900">{reservation.reservation_number}</p>
                      <p className="text-xs text-slate-500">
                        Estado: {reservation.status} · Pago: {reservation.payment_status}
                      </p>
                      <p className="text-base font-semibold text-slate-800">
                        Total: ${Number(reservation.total).toFixed(2)}
                      </p>
                    </div>
                    <Link href={`/checkout/confirmation?reservation=${reservation.reservation_number}`}>
                      <Button variant="secondary">Ver instrucciones de pago</Button>
                    </Link>
                  </div>

                  {firstAttendee?.qr_code ? (
                    <TicketQrCard
                      qrToken={firstAttendee.qr_code}
                      fileSlug={reservation.reservation_number.replace(/[^a-zA-Z0-9]+/g, "-")}
                      attendeeName={firstAttendee.full_name}
                      showQr={showQr}
                    />
                  ) : (
                    <p className="text-sm text-slate-600">
                      Tu código de entrada se generará al completar la reserva. Si ya pagaste y no ves el QR,
                      contacta al equipo.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-600">Todavía no tienes reservas registradas.</p>
      )}
    </section>
  );
}
