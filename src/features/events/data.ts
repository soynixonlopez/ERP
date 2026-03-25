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
    title: "Summer Beats 2026",
    slug: "summer-beats-2026",
    shortDescription: "Festival urbano con artistas internacionales y experiencia VIP.",
    description:
      "Un evento premium con tarima principal, zona lounge, experiencias gastronómicas y acceso por franjas horarias.",
    bannerUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    location: "Amador Convention Center, Ciudad de Panama",
    startAt: "2026-06-12T20:00:00.000Z",
    endAt: "2026-06-13T04:00:00.000Z",
    status: "published"
  },
  {
    id: EVENT_BUSINESS_SUMMIT_ID,
    organizationId: EPR_ORGANIZATION_ID,
    title: "EPR Business Summit",
    slug: "epr-business-summit",
    shortDescription: "Networking, charlas y workshops para lideres empresariales.",
    description:
      "Cumbre empresarial con espacios de mentorias, sesiones premium y ruedas de negocio segmentadas.",
    bannerUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    location: "Centro de Convenciones Atlapa",
    startAt: "2026-07-03T13:00:00.000Z",
    endAt: "2026-07-03T22:00:00.000Z",
    status: "published"
  }
];

/** IDs = `ticket_types.id` en Supabase (migración seed_ticket_types). */
export const mockTicketTypes: TicketTypeData[] = [
  {
    id: "3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f01",
    organizationId: EPR_ORGANIZATION_ID,
    eventId: EVENT_SUMMER_BEATS_ID,
    name: "Experiencia VIP Backstage",
    label: "VIP",
    price: 180,
    currency: "USD",
    benefits: ["Fila rapida", "Open bar premium", "Zona backstage"],
    inventory: 300,
    sold: 120,
    visibility: "public"
  },
  {
    id: "3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f02",
    organizationId: EPR_ORGANIZATION_ID,
    eventId: EVENT_SUMMER_BEATS_ID,
    name: "Entrada General",
    label: "GENERAL",
    price: 55,
    currency: "USD",
    benefits: ["Acceso general", "Zona food court"],
    inventory: 3000,
    sold: 1450,
    visibility: "public"
  },
  {
    id: "3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f03",
    organizationId: EPR_ORGANIZATION_ID,
    eventId: EVENT_SUMMER_BEATS_ID,
    name: "Pase Platino",
    label: "PLATINO",
    price: 99,
    currency: "USD",
    benefits: ["Acceso premium", "Zona lounge", "Experiencia VIP extendida"],
    inventory: 600,
    sold: 120,
    visibility: "public"
  },
  {
    id: "3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f04",
    organizationId: EPR_ORGANIZATION_ID,
    eventId: EVENT_BUSINESS_SUMMIT_ID,
    name: "Pase Platino",
    label: "PLATINO",
    price: 240,
    currency: "USD",
    benefits: ["Lunch ejecutivo", "Meet & greet speakers", "Asientos preferenciales"],
    inventory: 120,
    sold: 34,
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
