import { NextResponse } from "next/server";
import { z } from "zod";
import { requireReservationAdminActor } from "@/lib/auth/organization";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { zPgUuid } from "@/lib/validations/zod-pg-uuid";

const querySchema = z.object({
  organizationId: zPgUuid,
  eventId: zPgUuid,
  limit: z.coerce.number().int().min(1).max(5000).optional()
});

type CheckinRow = {
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

function mapCheckinRow(row: CheckinRow) {
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
}

/** Lista completa de asistencia para un evento (control de acceso admin). */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    organizationId: url.searchParams.get("organizationId"),
    eventId: url.searchParams.get("eventId"),
    limit: url.searchParams.get("limit") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parametros invalidos" }, { status: 400 });
  }

  const actor = await requireReservationAdminActor(parsed.data.organizationId);
  if (!actor) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const limit = parsed.data.limit ?? 2000;
  const supabase = createSupabaseAdminClient();

  const { data: rows, error } = await supabase
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
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: "No se pudo cargar la lista de asistencia" }, { status: 500 });
  }

  const attendance = (rows ?? []).map((r) => mapCheckinRow(r as unknown as CheckinRow));

  return NextResponse.json({ attendance, truncated: (rows?.length ?? 0) >= limit });
}
