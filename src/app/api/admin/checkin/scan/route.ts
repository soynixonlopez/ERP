import { NextResponse } from "next/server";
import { z } from "zod";
import { requireReservationAdminActor } from "@/lib/auth/organization";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { extractInviteTokenFromScan } from "@/lib/checkin/extract-qr-token";
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
  if (!token) {
    return NextResponse.json(
      { ok: false, code: "INVALID_TOKEN", message: "No se pudo leer el codigo" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("gate_register_checkin_by_qr", {
    p_organization_id: parsed.data.organizationId,
    p_event_id: parsed.data.eventId,
    p_qr_token: token,
    p_scanned_by: actor.userId
  });

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
