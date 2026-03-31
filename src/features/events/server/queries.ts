import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EPR_ORGANIZATION_ID } from "@/features/events/data";
import type { EventCardData, TicketTypeData } from "@/features/events/types";
import { mapEventRow, mapTicketRow, type TicketRow } from "@/features/events/server/mappers";

type EventDbRow = Parameters<typeof mapEventRow>[0] & { metadata?: unknown };

export async function fetchPublicEvents(organizationId: string = EPR_ORGANIZATION_ID): Promise<EventCardData[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, organization_id, title, slug, description, short_description, location, starts_at, ends_at, status, cover_image_url, desktop_banner_url, mobile_banner_url"
    )
    .eq("organization_id", organizationId)
    .in("status", ["published", "upcoming", "sold_out"])
    .order("starts_at", { ascending: true });

  if (error || !data) {
    console.error("[fetchPublicEvents]", error);
    return [];
  }

  return (data as EventDbRow[]).map((r) => mapEventRow(r));
}

export async function fetchPublicEventById(
  id: string,
  organizationId: string = EPR_ORGANIZATION_ID
): Promise<EventCardData | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, organization_id, title, slug, description, short_description, location, starts_at, ends_at, status, cover_image_url, desktop_banner_url, mobile_banner_url"
    )
    .eq("organization_id", organizationId)
    .eq("id", id)
    .in("status", ["published", "upcoming", "sold_out"])
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[fetchPublicEventById]", error);
    return null;
  }

  return mapEventRow(data as EventDbRow);
}

export async function fetchPublicEventBySlug(
  slug: string,
  organizationId: string = EPR_ORGANIZATION_ID
): Promise<EventCardData | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, organization_id, title, slug, description, short_description, location, starts_at, ends_at, status, cover_image_url, desktop_banner_url, mobile_banner_url"
    )
    .eq("organization_id", organizationId)
    .eq("slug", slug)
    .in("status", ["published", "upcoming", "sold_out"])
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[fetchPublicEventBySlug]", error);
    return null;
  }

  return mapEventRow(data as EventDbRow);
}

export async function fetchPublicTickets(
  organizationId: string = EPR_ORGANIZATION_ID
): Promise<TicketTypeData[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ticket_types")
    .select(
      `
      id,
      organization_id,
      event_id,
      name,
      description,
      badge_label,
      price,
      currency,
      inventory,
      sold,
      visibility,
      promotional_image_url,
      events!inner (
        id,
        starts_at,
        status,
        cover_image_url,
        desktop_banner_url,
        mobile_banner_url
      )
    `
    )
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .eq("visibility", "public")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("[fetchPublicTickets]", error);
    return [];
  }

  const out: TicketTypeData[] = [];
  for (const row of data as unknown as TicketRow[]) {
    const mapped = mapTicketRow(row);
    if (mapped) {
      out.push(mapped);
    }
  }
  return out;
}

export async function fetchPublicTicketsForEvent(eventId: string): Promise<TicketTypeData[]> {
  const all = await fetchPublicTickets();
  return all.filter((t) => t.eventId === eventId);
}

export async function fetchPublicTicketById(ticketId: string): Promise<TicketTypeData | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ticket_types")
    .select(
      `
      id,
      organization_id,
      event_id,
      name,
      description,
      badge_label,
      price,
      currency,
      inventory,
      sold,
      visibility,
      promotional_image_url,
      events!inner (
        id,
        starts_at,
        status,
        cover_image_url,
        desktop_banner_url,
        mobile_banner_url
      )
    `
    )
    .eq("id", ticketId)
    .eq("is_active", true)
    .eq("visibility", "public")
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[fetchPublicTicketById]", error);
    return null;
  }

  return mapTicketRow(data as unknown as TicketRow);
}

export type AdminEventRow = EventDbRow;

export async function fetchAdminEvents(organizationId: string = EPR_ORGANIZATION_ID): Promise<AdminEventRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("organization_id", organizationId)
    .order("starts_at", { ascending: false });

  if (error || !data) {
    console.error("[fetchAdminEvents]", error);
    return [];
  }

  return data as AdminEventRow[];
}

export async function fetchAdminEventById(
  id: string,
  organizationId: string = EPR_ORGANIZATION_ID
): Promise<AdminEventRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[fetchAdminEventById]", error);
    return null;
  }

  return data as AdminEventRow;
}

export type AdminTicketRow = {
  id: string;
  organization_id: string;
  event_id: string;
  name: string;
  description: string | null;
  badge_label: string | null;
  price: number | string;
  currency: string;
  inventory: number;
  sold: number;
  visibility: string;
  is_active: boolean;
  sort_order: number;
  promotional_image_url: string | null;
  events: { title: string; id: string } | { title: string; id: string }[] | null;
};

export async function fetchAdminTickets(organizationId: string = EPR_ORGANIZATION_ID): Promise<AdminTicketRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ticket_types")
    .select(
      `
      id,
      organization_id,
      event_id,
      name,
      description,
      badge_label,
      price,
      currency,
      inventory,
      sold,
      visibility,
      is_active,
      sort_order,
      promotional_image_url,
      events ( id, title )
    `
    )
    .eq("organization_id", organizationId)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("[fetchAdminTickets]", error);
    return [];
  }

  return data as AdminTicketRow[];
}

export async function fetchAdminTicketById(
  id: string,
  organizationId: string = EPR_ORGANIZATION_ID
): Promise<AdminTicketRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ticket_types")
    .select(
      `
      id,
      organization_id,
      event_id,
      name,
      description,
      badge_label,
      price,
      currency,
      inventory,
      sold,
      visibility,
      is_active,
      sort_order,
      promotional_image_url,
      events ( id, title )
    `
    )
    .eq("organization_id", organizationId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[fetchAdminTicketById]", error);
    return null;
  }

  return data as AdminTicketRow;
}
