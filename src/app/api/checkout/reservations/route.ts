import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeText } from "@/lib/utils/sanitize";
import { checkoutSchema } from "@/features/checkout/validations";
import { checkoutRateLimit, enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    const limitResult = await enforceRateLimit(checkoutRateLimit, `checkout:${ip}`);
    if (!limitResult.success) {
      return NextResponse.json({ error: "Demasiadas solicitudes, intenta de nuevo en breve." }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Solicitud sin datos válidos (JSON)." }, { status: 400 });
    }

    const rawBody =
      body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
    const parsed = checkoutSchema.safeParse({
      ...rawBody,
      buyerName: sanitizeText(String(rawBody.buyerName ?? "")),
      buyerPhone: sanitizeText(String(rawBody.buyerPhone ?? ""))
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
      console.error("[checkout/reservations] RPC create_reservation", error);
      return NextResponse.json(
        { error: error.message || "No fue posible crear la reserva" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reservationId: data?.reservation_id as string | undefined,
      reservationNumber: data?.reservation_number as string | undefined
    });
  } catch (e) {
    console.error("[checkout/reservations]", e);
    return NextResponse.json({ error: "Error interno al crear la reserva" }, { status: 500 });
  }
}
