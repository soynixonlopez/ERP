import { format } from "date-fns";

/** Fecha/hora en hora de Panamá (eventos públicos y catálogo). */
export function formatEventDatePa(iso: string): string {
  return new Date(iso).toLocaleString("es-PA", {
    timeZone: "America/Panama",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function dateKeyPanama(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Panama" });
}

/** Inicio (y fin si es otro día) para tarjetas y detalle de evento. */
export function formatEventSchedule(isoStart: string, isoEnd: string): string {
  if (dateKeyPanama(isoStart) === dateKeyPanama(isoEnd)) {
    return formatEventDatePa(isoStart);
  }
  return `${formatEventDatePa(isoStart)} → ${formatEventDatePa(isoEnd)}`;
}

export function formatEventDate(date: string): string {
  return format(new Date(date), "dd/MM/yyyy HH:mm");
}

const ES_MONTHS = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE"
] as const;

export function formatEventDayMonthEs(date: string): string {
  const d = new Date(date);
  const month = ES_MONTHS[d.getMonth()] ?? "";
  return `${month} ${d.getDate()}`;
}

export function formatEventWeekdayDateEs(date: string): string {
  const d = new Date(date);
  const weekday = d.toLocaleDateString("es-PA", { weekday: "long" });
  const month = ES_MONTHS[d.getMonth()]?.toLowerCase() ?? "";
  return `${weekday} ${d.getDate()} de ${month}`;
}

export function formatEventTimeAmPmEs(date: string): string {
  const d = new Date(date);
  // Forzamos AM/PM en mayuscula para coincidir el estilo de la UI.
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return time.replace(" ", "").toUpperCase();
}
