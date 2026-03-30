export type EventStatus = "draft" | "published" | "sold_out" | "cancelled" | "upcoming";

export type TicketVisibility = "public" | "hidden";

/** Contenido opcional de homepage asociado al evento destacado (`events.metadata.homepage`). */
export type EventHomepageBlock = {
  featured?: boolean;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  dateLine?: string;
  locationLine?: string;
  storyTitle?: string;
  storyLead?: string;
  storyBody?: string;
  storyBullets?: string[];
  storyImage?: string;
  artistImages?: string[];
};

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
  /** Imagen tarjeta / detalle paquete */
  promotionalImageUrl?: string;
  /** Banner del evento (respaldo si no hay promo) */
  eventBannerUrl?: string;
  eventStartAt: string;
};
