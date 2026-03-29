import { NextResponse } from "next/server";
import { z } from "zod";
import { requireReservationAdminActor } from "@/lib/auth/organization";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { zPgUuid } from "@/lib/validations/zod-pg-uuid";

const cancelSchema = z.object({
  organizationId: zPgUuid
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const payload = await request.json();
  const parsed = cancelSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalido" }, { status: 400 });
  }

  const actor = await requireReservationAdminActor(parsed.data.organizationId);
  if (!actor) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .select("id, status, payment_status, reservation_number")
    .eq("id", id)
    .eq("organization_id", parsed.data.organizationId)
    .single();

  if (reservationError || !reservation) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const nextPaymentStatus = reservation.payment_status === "paid" ? "refunded" : "failed";

  const { error: cancelError } = await supabase
    .from("reservations")
    .update({
      status: "cancelled",
      payment_status: nextPaymentStatus,
      cancelled_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("organization_id", parsed.data.organizationId);

  if (cancelError) {
    return NextResponse.json({ error: "No se pudo cancelar la reserva" }, { status: 500 });
  }

  const { data: itemRows } = await supabase
    .from("reservation_items")
    .select("ticket_type_id, quantity")
    .eq("reservation_id", id)
    .eq("organization_id", parsed.data.organizationId);

  if (itemRows?.length) {
    for (const item of itemRows) {
      const { data: ticket } = await supabase
        .from("ticket_types")
        .select("sold")
        .eq("id", item.ticket_type_id)
        .eq("organization_id", parsed.data.organizationId)
        .maybeSingle();

      if (ticket) {
        await supabase
          .from("ticket_types")
          .update({ sold: Math.max(0, Number(ticket.sold) - Number(item.quantity)) })
          .eq("id", item.ticket_type_id)
          .eq("organization_id", parsed.data.organizationId);
      }
    }
  }

  await supabase.from("audit_logs").insert({
    organization_id: parsed.data.organizationId,
    actor_user_id: actor.userId,
    entity_name: "reservations",
    entity_id: id,
    action: "cancel_reservation_admin",
    new_data: { reservation_number: reservation.reservation_number }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId");
  if (!organizationId) {
    return NextResponse.json({ error: "organizationId es requerido" }, { status: 400 });
  }

  const actor = await requireReservationAdminActor(organizationId);
  if (!actor) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: paymentRows } = await supabase
    .from("payments")
    .select("id")
    .eq("reservation_id", id)
    .eq("organization_id", organizationId)
    .limit(1);

  if (paymentRows?.length) {
    return NextResponse.json(
      { error: "No se puede eliminar una reserva con pagos registrados. Usa cancelar." },
      { status: 409 }
    );
  }

  const { error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar la reserva" }, { status: 500 });
  }

  await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    actor_user_id: actor.userId,
    entity_name: "reservations",
    entity_id: id,
    action: "delete_reservation_admin"
  });

  return NextResponse.json({ ok: true });
}
