/** Etiquetas en español para estados de reserva y pago (vista usuario). */

const RESERVATION_STATUS_ES: Record<string, string> = {
  draft: "Borrador",
  pending_payment: "Pendiente de pago",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  expired: "Expirada",
  refunded: "Reembolsada"
};

const PAYMENT_STATUS_ES: Record<string, string> = {
  pending: "Pendiente",
  processing: "En proceso",
  paid: "Pagado",
  failed: "Fallido",
  refunded: "Reembolsado",
  partially_refunded: "Reembolso parcial"
};

export function reservationStatusLabelEs(status: string): string {
  return RESERVATION_STATUS_ES[status] ?? status;
}

export function paymentStatusLabelEs(status: string): string {
  return PAYMENT_STATUS_ES[status] ?? status;
}

/**
 * Texto para badges: evita duplicar "pendiente" cuando reserva y pago dicen lo mismo al usuario.
 */
export function reservationPaymentBadgeLine(reservationStatus: string, paymentStatus: string): string {
  if (
    reservationStatus === "pending_payment" &&
    (paymentStatus === "pending" || paymentStatus === "processing")
  ) {
    return "Pendiente de pago";
  }
  return `Estado: ${reservationStatusLabelEs(reservationStatus)} · Pago: ${paymentStatusLabelEs(paymentStatus)}`;
}
