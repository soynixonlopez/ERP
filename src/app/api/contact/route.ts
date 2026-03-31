import { NextResponse } from "next/server";
import { z } from "zod";
import { authRateLimit, enforceRateLimit } from "@/lib/security/rate-limit";

const contactSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto").max(80, "Nombre muy largo"),
  correo: z.string().email("Correo invalido"),
  telefono: z.string().min(7, "Telefono muy corto").max(20, "Telefono muy largo"),
  mensaje: z.string().min(10, "Mensaje muy corto").max(2000, "Mensaje muy largo"),
  consent: z.boolean().refine((v) => v === true, "Debes aceptar el uso de tus datos")
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    const limitResult = await enforceRateLimit(authRateLimit, `contact:${ip}`);
    if (!limitResult.success) {
      return NextResponse.json(
        { ok: false, error: "Demasiadas solicitudes, intenta de nuevo en breve." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse({
      nombre: String(body?.nombre ?? ""),
      correo: String(body?.correo ?? ""),
      telefono: String(body?.telefono ?? ""),
      mensaje: String(body?.mensaje ?? ""),
      consent: Boolean(body?.consent)
    });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Datos invalidos" },
        { status: 400 }
      );
    }

    // TODO: Aquí puedes conectar un envío real (email/CRM) o guardarlo en Supabase.
    // Por ahora, confirmamos al cliente que el formulario fue recibido.

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Error al procesar la solicitud" }, { status: 500 });
  }
}

