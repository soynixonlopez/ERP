import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canManageOrganization, getOrganizationMembership } from "@/lib/auth/organization";
import { sendReservationConfirmedEmail } from "@/lib/notifications/reservation-confirmed";

const approveSchema = z.object({
  organizationId: z.uuid(),
  providerReference: z.string().max(120).optional()
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const payload = await request.json();
  const parsed = approveSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalido" }, { status: 400 });
  }

  const membership = await getOrganizationMembership(parsed.data.organizationId);
  if (!membership || !canManageOrganization(membership.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .select("id, reservation_number, buyer_name, buyer_email, total, organization_id, event_id, events(title)")
    .eq("id", id)
    .eq("organization_id", parsed.data.organizationId)
    .single();

  if (reservationError || !reservation) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const { data: isPaid, error: paidError } = await supabase.rpc("mark_reservation_paid", {
    p_organization_id: parsed.data.organizationId,
    p_reservation_id: id,
    p_provider: "manual",
    p_provider_reference: parsed.data.providerReference ?? "validacion-admin",
    p_amount: reservation.total
  });

  if (paidError || !isPaid) {
    return NextResponse.json({ error: "No se pudo aprobar la reserva" }, { status: 500 });
  }

  const qrToken = crypto.randomUUID();
  const { error: attendeeError } = await supabase
    .from("attendees")
    .update({ qr_code: qrToken })
    .eq("reservation_id", id)
    .is("qr_code", null);

  if (attendeeError) {
    return NextResponse.json({ error: "Reserva aprobada, pero no se pudo generar QR" }, { status: 500 });
  }

  const { data: attendee } = await supabase
    .from("attendees")
    .select("qr_code")
    .eq("reservation_id", id)
    .limit(1)
    .maybeSingle();

  const finalQrToken = attendee?.qr_code ?? qrToken;
  await sendReservationConfirmedEmail({
    to: reservation.buyer_email,
    customerName: reservation.buyer_name,
    reservationNumber: reservation.reservation_number,
    eventTitle: (reservation.events as { title?: string } | null)?.title ?? "Evento",
    qrToken: finalQrToken
  });

  await supabase.from("audit_logs").insert({
    organization_id: parsed.data.organizationId,
    actor_user_id: membership.userId,
    entity_name: "reservations",
    entity_id: id,
    action: "approve_manual_payment",
    new_data: {
      reservation_number: reservation.reservation_number,
      provider_reference: parsed.data.providerReference ?? null
    }
  });

  return NextResponse.json({ ok: true, qrToken: finalQrToken });
}
