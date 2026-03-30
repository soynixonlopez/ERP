import type { EventCardData, EventStatus, TicketTypeData } from "@/features/events/types";

type EventRow = {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  location: string;
  starts_at: string;
  ends_at: string;
  status: string;
  cover_image_url: string | null;
  desktop_banner_url: string | null;
  mobile_banner_url: string | null;
};

type EventJoinRow = {
  id: string;
  starts_at: string;
  status: string;
  cover_image_url: string | null;
  desktop_banner_url: string | null;
  mobile_banner_url: string | null;
};

export type TicketRow = {
  id: string;
  organization_id: string;
  event_id: string;
  name: string;
  description: string | null;
  badge_label: string | null;
  price: string | number;
  currency: string;
  inventory: number;
  sold: number;
  visibility: string;
  promotional_image_url: string | null;
  events: EventJoinRow | EventJoinRow[] | null;
};

const LABELS = new Set(["VIP", "GENERAL", "PLATINO"]);

function normalizeLabel(raw: string | null): TicketTypeData["label"] {
  const u = (raw ?? "").trim().toUpperCase();
  if (LABELS.has(u)) {
    return u as TicketTypeData["label"];
  }
  return "GENERAL";
}

function benefitsFromDescription(desc: string | null): string[] {
  if (!desc?.trim()) {
    return [];
  }
  return desc
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function eventJoinOne(row: TicketRow): EventJoinRow | null {
  const e = row.events;
  if (!e) return null;
  return Array.isArray(e) ? e[0] ?? null : e;
}

function eventBannerFromJoin(e: EventJoinRow | null): string {
  if (!e) return "";
  return (
    e.cover_image_url?.trim() ||
    e.desktop_banner_url?.trim() ||
    e.mobile_banner_url?.trim() ||
    ""
  );
}

export function mapEventRow(row: EventRow): EventCardData {
  const banner =
    row.cover_image_url?.trim() ||
    row.desktop_banner_url?.trim() ||
    row.mobile_banner_url?.trim() ||
    "";

  return {
    id: row.id,
    organizationId: row.organization_id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description?.trim() ?? "",
    description: row.description,
    bannerUrl: banner,
    location: row.location,
    startAt: row.starts_at,
    endAt: row.ends_at,
    status: row.status as EventStatus
  };
}

export function mapTicketRow(row: TicketRow): TicketTypeData | null {
  const ev = eventJoinOne(row);
  if (!ev) {
    return null;
  }
  if (ev.status !== "published" && ev.status !== "upcoming" && ev.status !== "sold_out") {
    return null;
  }

  const price = typeof row.price === "number" ? row.price : Number.parseFloat(String(row.price));
  if (!Number.isFinite(price)) {
    return null;
  }

  const eventBanner = eventBannerFromJoin(ev);
  const promo = row.promotional_image_url?.trim() || undefined;

  return {
    id: row.id,
    organizationId: row.organization_id,
    eventId: row.event_id,
    name: row.name,
    label: normalizeLabel(row.badge_label),
    price,
    currency: row.currency === "USD" ? "USD" : "USD",
    benefits: benefitsFromDescription(row.description),
    inventory: row.inventory,
    sold: row.sold,
    visibility: row.visibility === "hidden" ? "hidden" : "public",
    promotionalImageUrl: promo,
    eventBannerUrl: eventBanner || undefined,
    eventStartAt: ev.starts_at
  };
}
