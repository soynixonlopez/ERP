/**
 * Últimos 6 dígitos del número de reserva (segmento final tipo RSV-YYYYMMDD-NNNNNN)
 * para validación manual junto al QR.
 */
export function getReservationAccessCode(reservationNumber: string): string {
  const trimmed = reservationNumber.trim();
  if (!trimmed) return "------";
  const parts = trimmed.split("-");
  const lastSeg = parts[parts.length - 1] ?? "";
  const segDigits = lastSeg.replace(/\D/g, "");
  if (segDigits.length >= 6) return segDigits.slice(-6);
  const all = trimmed.replace(/\D/g, "");
  if (all.length >= 6) return all.slice(-6);
  if (segDigits.length > 0) return segDigits.padStart(6, "0").slice(-6);
  return "------";
}

/** Entrada manual en acceso: solo dígitos, se toman los últimos 6. */
export function parseReservationCheckInSuffix(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 6) return null;
  return digits.slice(-6);
}
