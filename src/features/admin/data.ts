import { getEvents, mockTicketTypes } from "@/features/events/data";

export type AdminReservationRow = {
  reservationNumber: string;
  customerName: string;
  email: string;
  event: string;
  packageName: string;
  quantity: number;
  reservationStatus: "confirmed" | "pending_payment";
  paymentStatus: "paid" | "pending";
  total: number;
};

export const adminEventsRows = getEvents().map((event) => ({
  id: event.id,
  title: event.title,
  slug: event.slug,
  location: event.location,
  startAt: event.startAt,
  status: event.status
}));

export const adminTicketsRows = mockTicketTypes.map((ticket) => ({
  id: ticket.id,
  name: ticket.name,
  label: ticket.label,
  price: ticket.price,
  inventory: ticket.inventory,
  sold: ticket.sold
}));

export const adminReservationsRows: AdminReservationRow[] = [
  {
    reservationNumber: "RSV-2026-10392",
    customerName: "Maria Gonzalez",
    email: "maria@email.com",
    event: "Summer Beats 2026",
    packageName: "Experiencia VIP Backstage",
    quantity: 1,
    reservationStatus: "confirmed",
    paymentStatus: "paid",
    total: 220
  },
  {
    reservationNumber: "RSV-2026-10391",
    customerName: "Luis Mena",
    email: "luis@email.com",
    event: "EPR Business Summit",
    packageName: "Pase Platino",
    quantity: 1,
    reservationStatus: "pending_payment",
    paymentStatus: "pending",
    total: 240
  }
];
