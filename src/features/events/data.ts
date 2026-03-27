import type { EventCardData, TicketTypeData } from "@/features/events/types";

/** Misma org que `supabase/seed/seed.sql` y migración de paquetes. */
export const EPR_ORGANIZATION_ID = "11111111-1111-1111-1111-111111111111";

/** Eventos en Supabase (`events.id`). */
export const EVENT_SUMMER_BEATS_ID = "22222222-2222-2222-2222-222222222222";
export const EVENT_BUSINESS_SUMMIT_ID = "44444444-4444-4444-4444-444444444444";

export const mockEvents: EventCardData[] = [
  {
    id: EVENT_SUMMER_BEATS_ID,
    organizationId: EPR_ORGANIZATION_ID,
    title: "Vallenato y Salsa en Taboga 2026",
    slug: "vallenato-salsa-taboga-2026",
    shortDescription: "Evento oficial activo con acceso por paquetes y reservas abiertas.",
    description:
      "Disfruta dos dias de musica en vivo frente al mar con experiencias VIP, crucero y acceso general en Taboga.",
    bannerUrl: "/assets/imagenes/BannerEventoTaboga.png",
    location: "Isla Perico, Calzada de Amador",
    startAt: "2026-04-04T14:00:00.000Z",
    endAt: "2026-04-05T23:00:00.000Z",
    status: "published"
  },
  {
    id: EVENT_BUSINESS_SUMMIT_ID,
    organizationId: EPR_ORGANIZATION_ID,
    title: "Próximo evento EPR",
    slug: "proximo-evento-epr",
    shortDescription: "Estamos preparando un nuevo evento tropical para ti.",
    description:
      "Muy pronto anunciaremos artistas, fecha y paquetes del siguiente gran evento. Activa tus notificaciones para enterarte primero.",
    bannerUrl: "",
    location: "Próximamente",
    startAt: "2026-08-01T18:00:00.000Z",
    endAt: "2026-08-01T23:00:00.000Z",
    status: "upcoming"
  }
];

/** IDs = `ticket_types.id` en Supabase (migración seed_ticket_types). */
export const mockTicketTypes: TicketTypeData[] = [
  {
    id: "3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f01",
    organizationId: EPR_ORGANIZATION_ID,
    eventId: EVENT_SUMMER_BEATS_ID,
    name: "Paquete 1 - Platino Crucero",
    label: "PLATINO",
    price: 75,
    currency: "USD",
    benefits: [
      "Transporte ida y vuelta en el crucero Majestic + silla + sombrilla en la playa + acceso Platino al evento (opcion de subir a VIP por $10 adicionales)"
    ],
    inventory: 800,
    sold: 210,
    visibility: "public"
  },
  {
    id: "3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f02",
    organizationId: EPR_ORGANIZATION_ID,
    eventId: EVENT_SUMMER_BEATS_ID,
    name: "Paquete 2 - VIP Crucero",
    label: "VIP",
    price: 99,
    currency: "USD",
    benefits: [
      "Transporte ida y vuelta en el crucero Majestic + silla + sombrilla en la playa + almuerzo + souvenirs + acceso VIP al evento"
    ],
    inventory: 700,
    sold: 255,
    visibility: "public"
  },
  {
    id: "3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f03",
    organizationId: EPR_ORGANIZATION_ID,
    eventId: EVENT_SUMMER_BEATS_ID,
    name: "Localidad VIP (solo evento)",
    label: "VIP",
    price: 35,
    currency: "USD",
    benefits: ["Acceso a zona VIP del evento (sin transporte)"],
    inventory: 1200,
    sold: 360,
    visibility: "public"
  },
  {
    id: "3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f04",
    organizationId: EPR_ORGANIZATION_ID,
    eventId: EVENT_SUMMER_BEATS_ID,
    name: "Palco Platino (solo evento)",
    label: "PLATINO",
    price: 25,
    currency: "USD",
    benefits: ["Acceso a zona Platino del evento (sin transporte)"],
    inventory: 900,
    sold: 214,
    visibility: "public"
  },
  {
    id: "3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f05",
    organizationId: EPR_ORGANIZATION_ID,
    eventId: EVENT_SUMMER_BEATS_ID,
    name: "General (solo evento)",
    label: "GENERAL",
    price: 15,
    currency: "USD",
    benefits: ["Acceso a zona general del evento (sin transporte)"],
    inventory: 3000,
    sold: 1200,
    visibility: "public"
  }
];

export function getEvents(): EventCardData[] {
  return mockEvents;
}

export function getEventBySlug(slug: string): EventCardData | undefined {
  return mockEvents.find((event) => event.slug === slug);
}

export function getTicketsByEventId(eventId: string): TicketTypeData[] {
  return mockTicketTypes.filter((ticket) => ticket.eventId === eventId && ticket.visibility === "public");
}

export function getTicketById(ticketId: string): TicketTypeData | undefined {
  return mockTicketTypes.find((ticket) => ticket.id === ticketId && ticket.visibility === "public");
}
