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
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.5;color:#0f172a">
        <tr><td style="padding-bottom:16px">
          <h1 style="margin:0;font-size:18px;font-weight:600">Reserva confirmada</h1>
        </td></tr>
        <tr><td style="padding-bottom:12px">
          <p style="margin:0">Estimado/a ${params.customerName},</p>
          <p style="margin:12px 0 0">La reserva <strong>${params.reservationNumber}</strong> para <strong>${params.eventTitle}</strong> quedó confirmada.</p>
        </td></tr>
        <tr><td style="padding:16px 0;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0">
          <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.04em">Acceso al evento</p>
          <p style="margin:0 0 12px;font-size:14px"><a href="${invitationUrl}" style="color:#1e40af">Abrir ticket digital</a></p>
          <p style="margin:0;font-size:12px;color:#64748b">URL directa (por si el enlace no abre):</p>
          <p style="margin:6px 0 16px;font-size:12px;word-break:break-all;font-family:ui-monospace,monospace;color:#334155">${invitationUrl}</p>
          <p style="margin:0;font-size:12px;color:#64748b">Identificador para validación manual en acceso:</p>
          <p style="margin:6px 0 0;padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;font-family:ui-monospace,monospace;font-size:13px;word-break:break-all;color:#0f172a">${params.qrToken}</p>
        </td></tr>
        <tr><td style="padding-top:16px">
          <p style="margin:0 0 12px;font-size:12px;color:#64748b">Código QR</p>
          <img src="${qrImageUrl}" width="280" height="280" alt="Código QR de acceso" style="display:block;border:1px solid #e2e8f0;border-radius:4px" />
        </td></tr>
      </table>
    `
  });
}
