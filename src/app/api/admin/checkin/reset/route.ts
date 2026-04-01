import { NextResponse } from "next/server";
import { z } from "zod";
import { requireReservationAdminActor } from "@/lib/auth/organization";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { zPgUuid } from "@/lib/validations/zod-pg-uuid";
import { checkinGateRateLimit, enforceRateLimit } from "@/lib/security/rate-limit";

const bodySchema = z.object({
  organizationId: zPgUuid,
  eventId: zPgUuid,
  /** YYYY-MM-DD en UTC: solo borra ingresos de ese día. Si se omite, borra todos los del evento. */
  controlDateUtc: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export async function POST(request: Request): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limitResult = await enforceRateLimit(checkinGateRateLimit, `checkin-reset:${ip}`);
  if (!limitResult.success) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Espere un momento." }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const actor = await requireReservationAdminActor(parsed.data.organizationId);
  if (!actor) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  const start = parsed.data.controlDateUtc ? `${parsed.data.controlDateUtc}T00:00:00.000Z` : null;
  const end = parsed.data.controlDateUtc ? `${parsed.data.controlDateUtc}T23:59:59.999Z` : null;

  let q = supabase
    .from("checkins")
    .delete({ count: "exact" })
    .eq("organization_id", parsed.data.organizationId)
    .eq("event_id", parsed.data.eventId);

  if (start && end) {
    q = q.gte("checked_in_at", start).lte("checked_in_at", end);
  }

  const { error, count } = await q;

  if (error) {
    return NextResponse.json({ error: "No se pudo reiniciar el control de acceso" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: count ?? 0 });
}
