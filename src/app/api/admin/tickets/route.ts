import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canManageOrganization, getOrganizationMembership } from "@/lib/auth/organization";
import { adminTicketSchema } from "@/lib/validations/admin-tickets";
import { sanitizeText } from "@/lib/utils/sanitize";

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId");
  if (!organizationId) {
    return NextResponse.json({ error: "organizationId es requerido" }, { status: 400 });
  }

  const membership = await getOrganizationMembership(organizationId);
  if (!membership) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ticket_types")
    .select("id, organization_id, event_id, name, badge_label, price, inventory, sold, visibility, is_active")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Error consultando paquetes" }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request): Promise<NextResponse> {
  const payload = await request.json();
  const parsed = adminTicketSchema.safeParse({
    ...payload,
    name: sanitizeText(String(payload?.name ?? "")),
    description: payload?.description ? sanitizeText(String(payload.description)) : undefined,
    badgeLabel: payload?.badgeLabel ? sanitizeText(String(payload.badgeLabel)) : undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalido" }, { status: 400 });
  }

  const membership = await getOrganizationMembership(parsed.data.organizationId);
  if (!membership || !canManageOrganization(membership.role)) {
    return NextResponse.json({ error: "No autorizado para gestionar paquetes" }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ticket_types")
    .insert({
      organization_id: parsed.data.organizationId,
      event_id: parsed.data.eventId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      badge_label: parsed.data.badgeLabel ?? null,
      price: parsed.data.price,
      inventory: parsed.data.inventory,
      min_per_order: parsed.data.minPerOrder,
      max_per_order: parsed.data.maxPerOrder,
      sort_order: parsed.data.sortOrder,
      visibility: parsed.data.visibility,
      is_active: parsed.data.isActive
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo crear el paquete" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
