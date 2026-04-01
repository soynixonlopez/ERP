import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type InviteTicketLine = {
  packageName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  badgeLabel: string | null;
};

export type InviteTicketData = {
  attendeeName: string;
  attendeeEmail: string | null;
  qrToken: string;
  reservationNumber: string;
  reservationStatus: string;
  paymentStatus: string;
  eventTitle: string;
  eventStartsAt: string | null;
  eventLocation: string | null;
  lines: InviteTicketLine[];
  total: number;
  buyerCountry: string | null;
  buyerAge: number | null;
  /** Todas las personas registradas en la misma reserva (titular + invitados), en orden de registro. */
  groupAttendeeNames: string[];
};

type TicketTypeRow = { name?: string; price?: number; badge_label?: string | null } | null;
type ReservationItemRow = {
  quantity?: number;
  unit_price?: number;
  line_total?: number;
  ticket_types?: TicketTypeRow | TicketTypeRow[];
};

type EventRow = { title?: string; starts_at?: string; location?: string } | null;
export type ReservationEmbedForTicket = {
  reservation_number?: string;
  status?: string;
  payment_status?: string;
  total?: number;
  buyer_country?: string | null;
  buyer_age?: number | null;
  events?: EventRow | EventRow[];
  reservation_items?: ReservationItemRow[] | null;
  attendees?: Array<{ full_name?: string | null; created_at?: string | null }> | null;
};

function firstEvent(events: EventRow | EventRow[] | null | undefined): EventRow {
  if (!events) return null;
  return Array.isArray(events) ? (events[0] ?? null) : events;
}

function ticketTypeFromItem(item: ReservationItemRow): TicketTypeRow {
  const tt = item.ticket_types;
  if (!tt) return null;
  return Array.isArray(tt) ? (tt[0] ?? null) : tt;
}

function groupNamesFromReservationEmbed(res: ReservationEmbedForTicket): string[] {
  const raw = Array.isArray(res.attendees) ? [...res.attendees] : [];
  raw.sort((a, b) => String(a.created_at ?? "").localeCompare(String(b.created_at ?? "")));
  return raw
    .map((a) => (typeof a.full_name === "string" ? a.full_name.trim() : ""))
    .filter((n) => n.length > 0);
}

function buildLines(rawItems: ReservationItemRow[]): InviteTicketLine[] {
  return rawItems.map((item) => {
    const tt = ticketTypeFromItem(item);
    return {
      packageName: tt?.name?.trim() || "Paquete",
      quantity: Number(item.quantity ?? 0),
      unitPrice: Number(item.unit_price ?? 0),
      lineTotal: Number(item.line_total ?? 0),
      badgeLabel: tt?.badge_label ?? null
    };
  });
}

type AttendeeForTicket = {
  full_name: string;
  email?: string | null;
  qr_code: string;
};

/** Construye el DTO del ticket a partir de la reserva embebida y el asistente (mismo formato que /invite). */
export function inviteTicketDataFromReservationAndAttendee(
  res: ReservationEmbedForTicket,
  attendee: AttendeeForTicket
): InviteTicketData {
  const ev = firstEvent(res.events);
  const rawItems = Array.isArray(res.reservation_items) ? res.reservation_items : [];

  const groupAttendeeNames = groupNamesFromReservationEmbed(res);

  return {
    attendeeName: attendee.full_name,
    attendeeEmail: attendee.email ?? null,
    qrToken: attendee.qr_code,
    reservationNumber: String(res.reservation_number ?? ""),
    reservationStatus: String(res.status ?? ""),
    paymentStatus: String(res.payment_status ?? ""),
    eventTitle: ev?.title?.trim() || "Evento",
    eventStartsAt: ev?.starts_at ?? null,
    eventLocation: ev?.location?.trim() ?? null,
    lines: buildLines(rawItems),
    total: Number(res.total ?? 0),
    buyerCountry: res.buyer_country != null ? String(res.buyer_country).trim() || null : null,
    buyerAge: (() => {
      if (res.buyer_age == null || String(res.buyer_age).trim() === "") return null;
      const n = Number(res.buyer_age);
      return Number.isFinite(n) ? n : null;
    })(),
    groupAttendeeNames
  };
}

/**
 * Datos del ticket digital: solo lectura por `qr_code` (token secreto), en servidor.
 */
export async function getInviteTicketData(token: string): Promise<InviteTicketData | null> {
  const trimmed = token?.trim();
  if (!trimmed || trimmed.length > 120) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  const { data: attendee, error } = await supabase
    .from("attendees")
    .select(
      `full_name,
       email,
       qr_code,
       reservations (
         reservation_number,
         status,
         payment_status,
         total,
         buyer_country,
         buyer_age,
         events ( title, starts_at, location ),
         reservation_items (
           quantity,
           unit_price,
           line_total,
           ticket_types ( name, price, badge_label )
         ),
         attendees ( full_name, created_at )
       )`
    )
    .eq("qr_code", trimmed)
    .maybeSingle();

  if (error || !attendee?.qr_code) {
    return null;
  }

  const res = attendee.reservations as ReservationEmbedForTicket | null;
  if (!res) {
    return null;
  }

  return inviteTicketDataFromReservationAndAttendee(res, {
    full_name: attendee.full_name as string,
    email: (attendee.email as string | null) ?? null,
    qr_code: attendee.qr_code as string
  });
}

/** Ticket para el dueño de la reserva (sesión), misma forma que la página pública /invite. */
export async function getInviteTicketDataForUserReservation(
  reservationId: string,
  userId: string
): Promise<InviteTicketData | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .select(
      `reservation_number, status, payment_status, total,
       buyer_country,
       buyer_age,
       events ( title, starts_at, location ),
       reservation_items (
         quantity, unit_price, line_total,
         ticket_types ( name, price, badge_label )
       ),
       attendees ( full_name, email, qr_code, created_at )`
    )
    .eq("id", reservationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const attendees = data.attendees as
    | Array<{ full_name?: string; email?: string | null; qr_code?: string | null }>
    | null;
  const att = attendees?.find((a) => a.qr_code) ?? attendees?.[0];
  if (!att?.full_name || !att.qr_code) {
    return null;
  }

  return inviteTicketDataFromReservationAndAttendee(data as ReservationEmbedForTicket, {
    full_name: att.full_name,
    email: att.email ?? null,
    qr_code: att.qr_code
  });
}
