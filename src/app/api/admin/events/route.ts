import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canManageOrganization, getOrganizationMembership } from "@/lib/auth/organization";
import { sanitizeText } from "@/lib/utils/sanitize";
import { adminEventSchema } from "@/lib/validations/admin-events";

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
    .from("events")
    .select("id, organization_id, title, slug, location, starts_at, status")
    .eq("organization_id", organizationId)
    .order("starts_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Error consultando eventos" }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request): Promise<NextResponse> {
  const payload = await request.json();
  const parsed = adminEventSchema.safeParse({
    ...payload,
    title: sanitizeText(String(payload?.title ?? "")),
    slug: sanitizeText(String(payload?.slug ?? "")),
    location: sanitizeText(String(payload?.location ?? "")),
    shortDescription: payload?.shortDescription ? sanitizeText(String(payload.shortDescription)) : undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalido" }, { status: 400 });
  }

  const membership = await getOrganizationMembership(parsed.data.organizationId);
  if (!membership || !canManageOrganization(membership.role)) {
    return NextResponse.json({ error: "No autorizado para gestionar eventos" }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("events")
    .insert({
      organization_id: parsed.data.organizationId,
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      short_description: parsed.data.shortDescription ?? null,
      location: parsed.data.location,
      starts_at: parsed.data.startsAt,
      ends_at: parsed.data.endsAt,
      status: parsed.data.status,
      created_by: user?.id ?? null
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo crear el evento" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
