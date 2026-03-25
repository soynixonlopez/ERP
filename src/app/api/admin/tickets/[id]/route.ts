import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canManageOrganization, getOrganizationMembership } from "@/lib/auth/organization";
import { adminTicketUpdateSchema } from "@/lib/validations/admin-tickets";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const payload = await request.json();
  const parsed = adminTicketUpdateSchema.safeParse({
    ...payload,
    id
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalido" }, { status: 400 });
  }

  const membership = await getOrganizationMembership(parsed.data.organizationId);
  if (!membership || !canManageOrganization(membership.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("ticket_types")
    .update({
      event_id: parsed.data.eventId,
      name: parsed.data.name,
      description: parsed.data.description,
      badge_label: parsed.data.badgeLabel,
      price: parsed.data.price,
      inventory: parsed.data.inventory,
      min_per_order: parsed.data.minPerOrder,
      max_per_order: parsed.data.maxPerOrder,
      sort_order: parsed.data.sortOrder,
      visibility: parsed.data.visibility,
      is_active: parsed.data.isActive
    })
    .eq("id", id)
    .eq("organization_id", parsed.data.organizationId);

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar el paquete" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId");
  if (!organizationId) {
    return NextResponse.json({ error: "organizationId es requerido" }, { status: 400 });
  }

  const membership = await getOrganizationMembership(organizationId);
  if (!membership || !canManageOrganization(membership.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("ticket_types")
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar el paquete" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
