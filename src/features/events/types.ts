export type EventStatus = "draft" | "published" | "sold_out" | "cancelled";

export type TicketVisibility = "public" | "hidden";

export type EventCardData = {
  id: string;
  organizationId: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  bannerUrl: string;
  location: string;
  startAt: string;
  endAt: string;
  status: EventStatus;
};

export type TicketTypeData = {
  id: string;
  organizationId: string;
  eventId: string;
  name: string;
  label: "VIP" | "GENERAL" | "PLATINO";
  price: number;
  currency: "USD";
  benefits: string[];
  inventory: number;
  sold: number;
  visibility: TicketVisibility;
};
