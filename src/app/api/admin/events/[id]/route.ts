import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canManageOrganization, getOrganizationMembership } from "@/lib/auth/organization";
import { adminEventUpdateSchema } from "@/lib/validations/admin-events";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const payload = await request.json();
  const parsed = adminEventUpdateSchema.safeParse({
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
    .from("events")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      short_description: parsed.data.shortDescription,
      location: parsed.data.location,
      starts_at: parsed.data.startsAt,
      ends_at: parsed.data.endsAt,
      status: parsed.data.status
    })
    .eq("id", id)
    .eq("organization_id", parsed.data.organizationId);

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar el evento" }, { status: 500 });
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
    .from("events")
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar el evento" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
