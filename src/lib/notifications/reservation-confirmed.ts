import { Resend } from "resend";
import { getAppBaseUrl } from "@/lib/config/manual-payments";

type SendReservationConfirmedEmailParams = {
  to: string;
  customerName: string;
  reservationNumber: string;
  eventTitle: string;
  qrToken: string;
};

export async function sendReservationConfirmedEmail(
  params: SendReservationConfirmedEmailParams
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return;
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "EPR Reservas <no-reply@epr.local>";
  const invitationUrl = `${getAppBaseUrl()}/invite/${params.qrToken}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(invitationUrl)}`;

  await resend.emails.send({
    from,
    to: params.to,
    subject: `Reserva confirmada: ${params.reservationNumber}`,
    html: `
      <h2>Tu reserva fue confirmada con exito</h2>
      <p>Hola ${params.customerName}, tu reserva <strong>${params.reservationNumber}</strong> para <strong>${params.eventTitle}</strong> ya esta confirmada.</p>
      <p>Tu invitacion y codigo QR unico:</p>
      <p><a href="${invitationUrl}">${invitationUrl}</a></p>
      <img src="${qrImageUrl}" alt="QR de invitacion" />
    `
  });
}
