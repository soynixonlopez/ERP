import type { EventCardData, TicketTypeData } from "@/features/events/types";

const ORG_ID = "org_demo_epr";

export const mockEvents: EventCardData[] = [
  {
    id: "evt_1",
    organizationId: ORG_ID,
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
    id: "evt_2",
    organizationId: ORG_ID,
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

export const mockTicketTypes: TicketTypeData[] = [
  {
    id: "tkt_1",
    organizationId: ORG_ID,
    eventId: "evt_1",
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
    id: "tkt_2",
    organizationId: ORG_ID,
    eventId: "evt_1",
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
    id: "tkt_3",
    organizationId: ORG_ID,
    eventId: "evt_2",
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
