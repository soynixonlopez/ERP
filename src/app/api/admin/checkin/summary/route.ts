import { NextResponse } from "next/server";
import { z } from "zod";
import { requireReservationAdminActor } from "@/lib/auth/organization";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { zPgUuid } from "@/lib/validations/zod-pg-uuid";

const querySchema = z.object({
  organizationId: zPgUuid,
  eventId: zPgUuid
});

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    organizationId: url.searchParams.get("organizationId"),
    eventId: url.searchParams.get("eventId")
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parametros invalidos" }, { status: 400 });
  }

  const actor = await requireReservationAdminActor(parsed.data.organizationId);
  if (!actor) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();

  const { count, error: countError } = await supabase
    .from("checkins")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", parsed.data.organizationId)
    .eq("event_id", parsed.data.eventId);

  if (countError) {
    return NextResponse.json({ error: "No se pudo contar ingresos" }, { status: 500 });
  }

  const { data: rows, error: recentError } = await supabase
    .from("checkins")
    .select(
      `
      checked_in_at,
      attendees (
        full_name,
        email,
        reservations ( reservation_number )
      )
    `
    )
    .eq("organization_id", parsed.data.organizationId)
    .eq("event_id", parsed.data.eventId)
    .order("checked_in_at", { ascending: false })
    .limit(25);

  if (recentError) {
    return NextResponse.json({ error: "No se pudo cargar el historial" }, { status: 500 });
  }

  const recent = (rows ?? []).map((r) => {
    const row = r as unknown as {
      checked_in_at: string;
      attendees:
        | {
            full_name?: string;
            email?: string | null;
            reservations?: { reservation_number?: string } | { reservation_number?: string }[] | null;
          }
        | {
            full_name?: string;
            email?: string | null;
            reservations?: { reservation_number?: string } | { reservation_number?: string }[] | null;
          }[]
        | null;
    };
    const att = row.attendees;
    const a = Array.isArray(att) ? att[0] : att;
    const res = a?.reservations;
    const resNum = Array.isArray(res) ? res[0]?.reservation_number : res?.reservation_number;
    return {
      checkedInAt: row.checked_in_at,
      fullName: a?.full_name ?? "—",
      email: a?.email ?? null,
      reservationNumber: resNum ?? "—"
    };
  });

  return NextResponse.json({
    count: count ?? 0,
    recent
  });
}
