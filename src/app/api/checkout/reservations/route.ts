import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeText } from "@/lib/utils/sanitize";
import { checkoutSchema } from "@/features/checkout/validations";
import { checkoutRateLimit, enforceRateLimit } from "@/lib/security/rate-limit";
import { logServerError } from "@/lib/logging/server-log";

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
    const guestRaw = Array.isArray(rawBody.guestNames) ? rawBody.guestNames : [];
    const parsed = checkoutSchema.safeParse({
      ...rawBody,
      buyerName: sanitizeText(String(rawBody.buyerName ?? "")),
      buyerPhone: sanitizeText(String(rawBody.buyerPhone ?? "")),
      buyerCountry: sanitizeText(String(rawBody.buyerCountry ?? "")),
      guestNames: guestRaw.map((g: unknown) => sanitizeText(String(g ?? "")))
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

    const guests =
      parsed.data.quantity > 1 ? parsed.data.guestNames.map((n) => sanitizeText(n)) : [];

    const { data, error } = await supabase.rpc("create_reservation", {
      p_organization_id: parsed.data.organizationId,
      p_user_id: user.id,
      p_event_id: parsed.data.eventId,
      p_ticket_type_id: parsed.data.ticketTypeId,
      p_quantity: parsed.data.quantity,
      p_buyer_name: parsed.data.buyerName,
      p_buyer_email: parsed.data.buyerEmail,
      p_buyer_phone: parsed.data.buyerPhone,
      p_buyer_country: parsed.data.buyerCountry,
      p_buyer_age: parsed.data.buyerAge,
      p_guest_names: guests
    });

    if (error) {
      logServerError("checkout/reservations.rpc", error);
      return NextResponse.json(
        { error: "No fue posible crear la reserva. Intenta de nuevo o contacta soporte." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reservationId: data?.reservation_id as string | undefined,
      reservationNumber: data?.reservation_number as string | undefined
    });
  } catch (e) {
    logServerError("checkout/reservations", e);
    return NextResponse.json({ error: "Error interno al crear la reserva" }, { status: 500 });
  }
}
