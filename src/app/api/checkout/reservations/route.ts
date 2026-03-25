import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeText } from "@/lib/utils/sanitize";
import { checkoutSchema } from "@/features/checkout/validations";
import { checkoutRateLimit, enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limitResult = await enforceRateLimit(checkoutRateLimit, `checkout:${ip}`);
  if (!limitResult.success) {
    return NextResponse.json({ error: "Demasiadas solicitudes, intenta de nuevo en breve." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse({
    ...body,
    buyerName: sanitizeText(String(body?.buyerName ?? "")),
    buyerPhone: sanitizeText(String(body?.buyerPhone ?? ""))
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Payload invalido" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("create_reservation", {
    p_organization_id: parsed.data.organizationId,
    p_user_id: user.id,
    p_event_id: parsed.data.eventId,
    p_ticket_type_id: parsed.data.ticketTypeId,
    p_quantity: parsed.data.quantity,
    p_buyer_name: parsed.data.buyerName,
    p_buyer_email: parsed.data.buyerEmail,
    p_buyer_phone: parsed.data.buyerPhone
  });

  if (error) {
    return NextResponse.json({ error: "No fue posible crear la reserva" }, { status: 500 });
  }

  return NextResponse.json({
    reservationId: data?.reservation_id as string | undefined,
    reservationNumber: data?.reservation_number as string | undefined
  });
}
