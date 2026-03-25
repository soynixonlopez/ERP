import { format } from "date-fns";

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
