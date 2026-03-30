"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canAccessAdminPanel } from "@/lib/auth/admin-access";
import { EPR_ORGANIZATION_ID } from "@/features/events/data";
import { parseEventMetadata } from "@/features/events/server/metadata";
import type { EventHomepageBlock } from "@/features/events/types";

const BUCKET = "promotional";

export type CatalogActionResult = { ok: true } | { ok: false; error: string };

function friendlyDbError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("row-level security") ||
    m.includes("rls") ||
    m.includes("permission denied") ||
    m.includes("42501") ||
    m.includes("violates row-level security")
  ) {
    return "Sin permiso en base de datos: añade SUPABASE_SERVICE_ROLE_KEY en el servidor y vuelve a entrar en /admin (se crea la membresía automática), o inserta tu usuario en organization_members con rol admin/staff.";
  }
  return message;
}

async function requireCatalogAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No autenticado");
  }
  if (!(await canAccessAdminPanel(user))) {
    throw new Error("Sin permiso para administrar el catálogo");
  }
  return { supabase, user };
}

function extFromFileName(name: string): string {
  const part = name.split(".").pop()?.toLowerCase();
  if (part && ["jpg", "jpeg", "png", "webp", "gif"].includes(part)) {
    return part === "jpeg" ? "jpg" : part;
  }
  return "jpg";
}

async function uploadImageIfPresent(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  fieldName: string,
  formData: FormData
): Promise<string | null> {
  const raw = formData.get(fieldName);
  if (!(raw instanceof File) || raw.size === 0) {
    return null;
  }
  const ext = extFromFileName(raw.name);
  const path = `${EPR_ORGANIZATION_ID}/promo/${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await raw.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: raw.type || "image/jpeg",
    upsert: false
  });
  if (error) {
    console.error("[uploadImageIfPresent]", fieldName, error);
    throw new Error(error.message || "No se pudo subir la imagen");
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function optionalStr(formData: FormData, key: string): string | undefined {
  const s = str(formData, key);
  return s.length > 0 ? s : undefined;
}

function bulletsFromTextarea(text: string): string[] | undefined {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : undefined;
}

function artistsFromInputs(formData: FormData): string[] | undefined {
  const urls = [str(formData, "hp_artist1"), str(formData, "hp_artist2"), str(formData, "hp_artist3")].filter(
    Boolean
  );
  return urls.length > 0 ? urls : undefined;
}

function buildHomepageFromForm(formData: FormData): EventHomepageBlock {
  const bullets = bulletsFromTextarea(str(formData, "hp_storyBullets"));
  return {
    featured: formData.get("hp_block_featured") === "on",
    heroTitle: optionalStr(formData, "hp_heroTitle"),
    heroSubtitle: optionalStr(formData, "hp_heroSubtitle"),
    heroImage: optionalStr(formData, "hp_heroImage"),
    dateLine: optionalStr(formData, "hp_dateLine"),
    locationLine: optionalStr(formData, "hp_locationLine"),
    storyTitle: optionalStr(formData, "hp_storyTitle"),
    storyLead: optionalStr(formData, "hp_storyLead"),
    storyBody: optionalStr(formData, "hp_storyBody"),
    storyBullets: bullets,
    storyImage: optionalStr(formData, "hp_storyImage"),
    artistImages: artistsFromInputs(formData)
  };
}

function mergeEventMetadata(existing: unknown, formData: FormData): Record<string, unknown> {
  const prev = parseEventMetadata(existing);
  const homepage = buildHomepageFromForm(formData);
  const rootFeatured = formData.get("metadata_homepage_featured") === "on";

  return {
    ...(typeof existing === "object" && existing !== null && !Array.isArray(existing)
      ? (existing as Record<string, unknown>)
      : {}),
    homepage_featured: rootFeatured || homepage.featured === true,
    homepage: {
      ...prev.homepage,
      ...homepage
    }
  };
}

/**
 * Firma compatible con useActionState: React invoca action(estadoPrevio, formData).
 */
export async function saveEventAction(
  _prevState: CatalogActionResult | null,
  formData: FormData
): Promise<CatalogActionResult> {
  try {
    const { supabase, user } = await requireCatalogAdmin();
    const id = str(formData, "id");
    const title = str(formData, "title");
    const slug = str(formData, "slug");
    const description = str(formData, "description");
    const location = str(formData, "location");
    const startsAt = str(formData, "starts_at");
    const endsAt = str(formData, "ends_at");
    const status = str(formData, "status");
    const shortDescription = optionalStr(formData, "short_description") ?? "";

    if (!title || !slug || !description || !location || !startsAt || !endsAt || !status) {
      return { ok: false, error: "Completa los campos obligatorios del evento." };
    }

    let coverUrl = optionalStr(formData, "cover_image_url");
    const uploadedCover = await uploadImageIfPresent(supabase, "cover_file", formData);
    if (uploadedCover) {
      coverUrl = uploadedCover;
    }

    let existingMeta: unknown = {};
    if (id) {
      const { data: row } = await supabase
        .from("events")
        .select("metadata")
        .eq("id", id)
        .eq("organization_id", EPR_ORGANIZATION_ID)
        .maybeSingle();
      existingMeta = row?.metadata ?? {};
    }

    const metadata = mergeEventMetadata(existingMeta, formData);

    const payload = {
      organization_id: EPR_ORGANIZATION_ID,
      title,
      slug,
      description,
      short_description: shortDescription || null,
      location,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      status,
      cover_image_url: coverUrl ?? null,
      metadata,
      created_by: user.id
    };

    if (id) {
      const { error } = await supabase
        .from("events")
        .update({
          title: payload.title,
          slug: payload.slug,
          description: payload.description,
          short_description: payload.short_description,
          location: payload.location,
          starts_at: payload.starts_at,
          ends_at: payload.ends_at,
          status: payload.status,
          cover_image_url: payload.cover_image_url,
          metadata: payload.metadata
        })
        .eq("id", id)
        .eq("organization_id", EPR_ORGANIZATION_ID);
      if (error) {
        console.error("[saveEventAction] update", error);
        return {
          ok: false,
          error: error.message.includes("unique")
            ? "El slug ya existe."
            : friendlyDbError(error.message)
        };
      }
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) {
        console.error("[saveEventAction] insert", error);
        return {
          ok: false,
          error: error.message.includes("unique")
            ? "El slug ya existe."
            : friendlyDbError(error.message)
        };
      }
    }

    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath("/packages");
    revalidatePath("/admin/events");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al guardar el evento";
    return { ok: false, error: msg };
  }
}

export async function saveTicketAction(
  _prevState: CatalogActionResult | null,
  formData: FormData
): Promise<CatalogActionResult> {
  try {
    const { supabase } = await requireCatalogAdmin();
    const id = str(formData, "id");
    const eventId = str(formData, "event_id");
    const name = str(formData, "name");
    const description = str(formData, "description");
    const rawBadge = str(formData, "badge_label").toUpperCase();
    const badgeLabel = ["VIP", "PLATINO", "GENERAL"].includes(rawBadge) ? rawBadge : "GENERAL";
    const priceRaw = str(formData, "price");
    const inventoryRaw = str(formData, "inventory");
    const visibility = str(formData, "visibility") || "public";
    const sortOrderRaw = str(formData, "sort_order");

    if (!eventId || !name || !priceRaw || !inventoryRaw) {
      return { ok: false, error: "Completa evento, nombre, precio e inventario." };
    }

    const price = Number.parseFloat(priceRaw);
    const inventory = Number.parseInt(inventoryRaw, 10);
    const sortOrder = sortOrderRaw ? Number.parseInt(sortOrderRaw, 10) : 0;

    if (!Number.isFinite(price) || price < 0) {
      return { ok: false, error: "Precio inválido." };
    }
    if (!Number.isFinite(inventory) || inventory < 0) {
      return { ok: false, error: "Inventario inválido." };
    }

    let promoUrl = optionalStr(formData, "promotional_image_url");
    const uploaded = await uploadImageIfPresent(supabase, "promo_file", formData);
    if (uploaded) {
      promoUrl = uploaded;
    }

    const row = {
      organization_id: EPR_ORGANIZATION_ID,
      event_id: eventId,
      name,
      description: description || null,
      badge_label: badgeLabel,
      price,
      currency: "USD" as const,
      inventory,
      visibility,
      is_active: str(formData, "is_active") !== "false",
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      promotional_image_url: promoUrl ?? null
    };

    if (id) {
      const { error } = await supabase
        .from("ticket_types")
        .update(row)
        .eq("id", id)
        .eq("organization_id", EPR_ORGANIZATION_ID);
      if (error) {
        console.error("[saveTicketAction] update", error);
        return { ok: false, error: friendlyDbError(error.message) };
      }
    } else {
      const { error } = await supabase.from("ticket_types").insert({ ...row, sold: 0 });
      if (error) {
        console.error("[saveTicketAction] insert", error);
        return { ok: false, error: friendlyDbError(error.message) };
      }
    }

    revalidatePath("/");
    revalidatePath("/packages");
    revalidatePath("/events");
    revalidatePath("/admin/packages");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al guardar el paquete";
    return { ok: false, error: msg };
  }
}

function revalidateCatalogPaths(): void {
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/packages");
  revalidatePath("/admin/events");
  revalidatePath("/admin/packages");
}

export async function deleteEventAction(eventId: string): Promise<CatalogActionResult> {
  try {
    const { supabase } = await requireCatalogAdmin();
    if (!eventId?.trim()) {
      return { ok: false, error: "Evento no válido." };
    }

    const { count, error: countError } = await supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", EPR_ORGANIZATION_ID)
      .eq("event_id", eventId);

    if (countError) {
      console.error("[deleteEventAction] count", countError);
      return { ok: false, error: friendlyDbError(countError.message) };
    }
    if (count && count > 0) {
      return {
        ok: false,
        error: `Este evento tiene ${count} reserva(s). No se puede eliminar; cambia el estado a borrador o cancelado.`
      };
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("organization_id", EPR_ORGANIZATION_ID);

    if (error) {
      console.error("[deleteEventAction] delete", error);
      return { ok: false, error: friendlyDbError(error.message) };
    }

    revalidateCatalogPaths();
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al eliminar el evento";
    return { ok: false, error: msg };
  }
}

export async function deleteTicketAction(ticketId: string): Promise<CatalogActionResult> {
  try {
    const { supabase } = await requireCatalogAdmin();
    if (!ticketId?.trim()) {
      return { ok: false, error: "Paquete no válido." };
    }

    const { count, error: countError } = await supabase
      .from("reservation_items")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", EPR_ORGANIZATION_ID)
      .eq("ticket_type_id", ticketId);

    if (countError) {
      console.error("[deleteTicketAction] count", countError);
      return { ok: false, error: friendlyDbError(countError.message) };
    }
    if (count && count > 0) {
      return {
        ok: false,
        error: `Este paquete aparece en ${count} línea(s) de reserva. Desactívalo u ocúltalo en lugar de borrarlo.`
      };
    }

    const { error } = await supabase
      .from("ticket_types")
      .delete()
      .eq("id", ticketId)
      .eq("organization_id", EPR_ORGANIZATION_ID);

    if (error) {
      console.error("[deleteTicketAction] delete", error);
      return { ok: false, error: friendlyDbError(error.message) };
    }

    revalidateCatalogPaths();
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al eliminar el paquete";
    return { ok: false, error: msg };
  }
}
