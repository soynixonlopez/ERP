"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const contactSchema = z.object({
  nombre: z.string().min(2).max(80),
  correo: z.string().email(),
  telefono: z.string().min(7).max(20),
  mensaje: z.string().min(10).max(2000),
  consent: z.boolean()
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm(): JSX.Element {
  const [values, setValues] = useState<ContactFormValues>({
    nombre: "",
    correo: "",
    telefono: "",
    mensaje: "",
    consent: false
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    setSuccess(false);

    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      setServerError(parsed.error.issues[0]?.message ?? "Datos invalidos");
      return;
    }

    try {
      setPending(true);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: values.nombre,
          correo: values.correo,
          telefono: values.telefono,
          mensaje: values.mensaje,
          consent: values.consent
        })
      });

      const payload = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !payload.ok) {
        setServerError(payload.error ?? "Error al enviar el formulario");
        return;
      }

      setSuccess(true);
      setValues({ nombre: "", correo: "", telefono: "", mensaje: "", consent: false });
    } catch {
      setServerError("Error de red. Intenta nuevamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-2xl border border-[var(--border)] bg-white/95 p-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--epr-blue-800)]" htmlFor="nombre">
            * Nombre
          </label>
          <Input
            id="nombre"
            value={values.nombre}
            onChange={(e) => setValues((v) => ({ ...v, nombre: e.target.value }))}
            placeholder="Tu nombre"
          />
        </div>

        <div className="space-y-2 pt-3">
          <label className="text-sm font-semibold text-[var(--epr-blue-800)]" htmlFor="correo">
            * Correo
          </label>
          <Input
            id="correo"
            type="email"
            value={values.correo}
            onChange={(e) => setValues((v) => ({ ...v, correo: e.target.value }))}
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div className="space-y-2 pt-3">
          <label className="text-sm font-semibold text-[var(--epr-blue-800)]" htmlFor="telefono">
            * Teléfono
          </label>
          <Input
            id="telefono"
            value={values.telefono}
            onChange={(e) => setValues((v) => ({ ...v, telefono: e.target.value }))}
            placeholder="+507..."
          />
        </div>

        <div className="space-y-2 pt-3">
          <label className="text-sm font-semibold text-[var(--epr-blue-800)]" htmlFor="mensaje">
            * Mensaje
          </label>
          <textarea
            id="mensaje"
            value={values.mensaje}
            onChange={(e) => setValues((v) => ({ ...v, mensaje: e.target.value }))}
            rows={5}
            className="w-full resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            placeholder="Cuéntanos en qué necesitas ayuda"
          />
        </div>

        <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={values.consent}
            onChange={(e) => setValues((v) => ({ ...v, consent: e.target.checked }))}
            className="mt-1 size-4 accent-[var(--primary)]"
          />
          <span className="leading-relaxed">
            Acepto el uso de mis datos para responder mi solicitud.
          </span>
        </label>

        {serverError ? <p className="pt-2 text-sm font-medium text-red-600">{serverError}</p> : null}
        {success ? (
          <p className="pt-2 text-sm font-semibold text-emerald-600">
            Mensaje enviado. Te contactaremos pronto.
          </p>
        ) : null}

        <div className="pt-4">
          <Button className="w-full" type="submit" disabled={pending}>
            {pending ? "Enviando..." : "Enviar mensaje"}
          </Button>
        </div>
      </div>
    </form>
  );
}

