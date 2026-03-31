import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/features/contact/components/contact-form";

export default function ContactPage(): JSX.Element {
  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div className="relative inline-block">
        <h1 className="text-4xl font-black tracking-tight text-[var(--epr-blue-800)]">Contacto</h1>
        <div className="mt-1 h-1 w-20 bg-[var(--accent)]" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 md:items-stretch">
        {/* Panel informativo */}
        <Card className="h-full rounded-2xl border border-[var(--border)] bg-white">
          <CardContent className="flex h-full flex-col gap-4 p-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--epr-blue-800)]">Equipo EPR S.A.</p>
              <p className="text-sm text-slate-600">
                Si prefieres, también puedes comunicarte directamente por WhatsApp o correo.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl bg-[var(--epr-surface)] p-4">
                <Phone className="mt-0.5 size-5 text-[var(--primary)]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">WhatsApp</p>
                  <p className="text-sm text-slate-600">+507 6795-8877</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-[var(--epr-surface)] p-4">
                <p className="mt-0.5 size-5 rounded-full bg-[var(--accent)]/15 text-center text-xs font-black leading-5 text-[var(--accent)]">
                  @
                </p>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Correo</p>
                  <p className="text-[11px] leading-snug text-slate-600 break-words sm:text-sm">
                    ernestopuerta1124@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-[var(--epr-surface)] p-4 sm:col-span-2">
                <MapPin className="mt-0.5 size-5 text-[var(--primary)]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Ubicación</p>
                  <p className="text-sm text-slate-600">Panamá (atención online)</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--epr-surface)] p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Horario</p>
              <p className="text-slate-600">Lunes a sábado, 8:00 am - 8:00 pm</p>
            </div>

            <div className="mt-auto pt-1">
              <Link href="/packages" className="inline-block">
                <p className="text-sm font-semibold text-[var(--primary)] hover:underline">Ver paquetes disponibles</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Formulario */}
        <div className="h-full">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
