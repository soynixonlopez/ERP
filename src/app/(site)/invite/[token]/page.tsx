import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppBaseUrl } from "@/lib/config/manual-payments";

type InvitePageProps = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: InvitePageProps): Promise<JSX.Element> {
  const { token } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: attendee } = await supabase
    .from("attendees")
    .select(
      "full_name, email, qr_code, reservations(reservation_number, status, payment_status, total, events(title, starts_at, location))"
    )
    .eq("qr_code", token)
    .maybeSingle();

  if (!attendee) {
    notFound();
  }

  const reservationItem = (attendee.reservations as
    | Array<{
        reservation_number: string;
        status: string;
        payment_status: string;
        total: number;
        events?: Array<{ title?: string; starts_at?: string; location?: string }> | null;
      }>
    | null)?.[0];
  const eventData = reservationItem?.events?.[0];

  const invitationUrl = `${getAppBaseUrl()}/invite/${token}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=340x340&data=${encodeURIComponent(invitationUrl)}`;

  return (
    <section className="mx-auto grid max-w-5xl gap-6 rounded-2xl border border-[var(--border)] bg-white p-6 md:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4">
        <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          Invitacion valida
        </p>
        <h1 className="text-3xl font-black text-slate-900">Confirmacion de datos del cliente</h1>
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold">Cliente:</span> {attendee.full_name}
          </p>
          <p>
            <span className="font-semibold">Correo:</span> {attendee.email ?? "-"}
          </p>
          <p>
            <span className="font-semibold">Reserva:</span> {reservationItem?.reservation_number ?? "-"}
          </p>
          <p>
            <span className="font-semibold">Estado reserva:</span> {reservationItem?.status ?? "-"}
          </p>
          <p>
            <span className="font-semibold">Estado pago:</span> {reservationItem?.payment_status ?? "-"}
          </p>
          <p>
            <span className="font-semibold">Evento:</span> {eventData?.title ?? "-"}
          </p>
          <p>
            <span className="font-semibold">Ubicacion:</span> {eventData?.location ?? "-"}
          </p>
          <p>
            <span className="font-semibold">Total:</span> ${Number(reservationItem?.total ?? 0).toFixed(2)}
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
        <img src={qrImageUrl} alt="Codigo QR de invitacion" className="mx-auto w-full max-w-[320px] rounded-lg" />
        <p className="mt-3 text-center text-xs text-slate-500">QR unico para validacion de acceso</p>
      </div>
    </section>
  );
}
