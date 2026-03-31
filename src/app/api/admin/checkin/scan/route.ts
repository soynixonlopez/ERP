import { NextResponse } from "next/server";
import { z } from "zod";
import { requireReservationAdminActor } from "@/lib/auth/organization";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { extractInviteTokenFromScan } from "@/lib/checkin/extract-qr-token";
import { parseReservationCheckInSuffix } from "@/lib/reservations/reservation-access-code";
import { zPgUuid } from "@/lib/validations/zod-pg-uuid";

const scanBodySchema = z.object({
  organizationId: zPgUuid,
  eventId: zPgUuid,
  raw: z.string().min(1).max(4000)
});

export async function POST(request: Request): Promise<NextResponse> {
  const json = await request.json().catch(() => null);
  const parsed = scanBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const actor = await requireReservationAdminActor(parsed.data.organizationId);
  if (!actor) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const token = extractInviteTokenFromScan(parsed.data.raw);
  const supabase = createSupabaseAdminClient();

  let data: unknown;
  let error: { message?: string } | null;

  if (token) {
    const res = await supabase.rpc("gate_register_checkin_by_qr", {
      p_organization_id: parsed.data.organizationId,
      p_event_id: parsed.data.eventId,
      p_qr_token: token,
      p_scanned_by: actor.userId
    });
    data = res.data;
    error = res.error;
  } else {
    const suffix = parseReservationCheckInSuffix(parsed.data.raw);
    if (!suffix) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_TOKEN",
          message: "Use la URL o UUID del QR, o los 6 digitos del numero de reserva"
        },
        { status: 400 }
      );
    }
    const res = await supabase.rpc("gate_register_checkin_by_reservation_suffix", {
      p_organization_id: parsed.data.organizationId,
      p_event_id: parsed.data.eventId,
      p_suffix: suffix,
      p_scanned_by: actor.userId
    });
    data = res.data;
    error = res.error;
  }

  if (error) {
    return NextResponse.json(
      { ok: false, code: "SERVER", message: error.message ?? "Error al registrar ingreso" },
      { status: 500 }
    );
  }

  const raw = data as unknown;
  const payload =
    typeof raw === "string"
      ? (JSON.parse(raw) as Record<string, unknown>)
      : (raw as Record<string, unknown> | null);
  if (!payload || typeof payload.ok !== "boolean") {
    return NextResponse.json({ ok: false, code: "SERVER", message: "Respuesta invalida" }, { status: 500 });
  }

  return NextResponse.json(payload);
}
