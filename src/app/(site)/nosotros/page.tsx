import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Heart, Shield, Sparkles, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sobre nosotros | EPR Reservas",
  description:
    "Conoce a EPR S.A.: quiénes somos, valores, historia y el equipo detrás de las reservas de eventos."
};

const VALUES = [
  {
    title: "Transparencia",
    text: "Procesos claros en precios, condiciones y soporte antes, durante y después de tu reserva."
  },
  {
    title: "Seguridad",
    text: "Priorizamos la protección de tus datos y un flujo de compra confiable."
  },
  {
    title: "Cercanía",
    text: "Atención humana para resolver dudas y acompañarte en el acceso a los eventos."
  },
  {
    title: "Compromiso",
    text: "Trabajamos para que cada experiencia con EPR sea ordenada, memorable y sin sorpresas negativas."
  }
] as const;

const TEAM = [
  {
    name: "Dirección y operaciones",
    role: "Coordinación general",
    bio: "Define la visión del proyecto y asegura que cada evento cumpla estándares de calidad."
  },
  {
    name: "Experiencia y soporte",
    role: "Atención al cliente",
    bio: "Responde consultas, guía reservas y ayuda con el acceso y la información del evento."
  },
  {
    name: "Tecnología",
    role: "Plataforma y pagos",
    bio: "Mantiene la web estable, segura y alineada con las necesidades de los asistentes."
  }
] as const;

export default function NosotrosPage(): JSX.Element {
  return (
    <section className="mx-auto w-full max-w-5xl space-y-12">
      <header className="space-y-3">
        <div className="relative inline-block">
          <h1 className="text-4xl font-black tracking-tight text-[var(--epr-blue-800)]">Sobre nosotros</h1>
          <div className="mt-1 h-1 w-24 bg-[var(--accent)]" />
        </div>
        <p className="max-w-3xl text-lg text-slate-600">
          EPR S.A. es una empresa panameña dedicada a facilitar la reserva de paquetes y experiencias para
          eventos, con un enfoque claro: orden, confianza y buen servicio.
        </p>
      </header>

      <section aria-labelledby="empresa-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="size-6 text-[var(--primary)]" aria-hidden />
          <h2 id="empresa-heading" className="text-2xl font-bold text-[var(--epr-blue-800)]">
            La empresa
          </h2>
        </div>
        <Card className="rounded-2xl border border-[var(--border)] bg-white">
          <CardContent className="space-y-4 p-6 text-sm text-slate-700 md:text-base">
            <p>
              <strong className="text-slate-900">EPR S.A.</strong> nace con la idea de centralizar la oferta de
              eventos y paquetes en un solo lugar, reduciendo fricciones para quienes quieren asistir y para
              quienes organizan experiencias memorables.
            </p>
            <p>
              Nuestra plataforma conecta a los usuarios con opciones de reserva verificadas, información
              actualizada y canales de contacto directos para resolver cualquier duda.
            </p>
            <div className="grid gap-4 rounded-xl bg-[var(--epr-surface)] p-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Misión</p>
                <p className="mt-1 text-sm text-slate-700">
                  Simplificar la reserva de paquetes para eventos, con procesos honestos y soporte cercano.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Visión</p>
                <p className="mt-1 text-sm text-slate-700">
                  Ser un referente en Panamá en gestión de reservas de eventos y experiencias asociadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="valores-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="size-6 text-[var(--primary)]" aria-hidden />
          <h2 id="valores-heading" className="text-2xl font-bold text-[var(--epr-blue-800)]">
            Valores
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map((v) => (
            <Card key={v.title} className="rounded-2xl border border-[var(--border)] bg-white">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-xl bg-[var(--accent)]/15">
                    <Shield className="size-4 text-[var(--accent)]" aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--epr-blue-800)]">{v.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{v.text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="historia-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-6 text-[var(--primary)]" aria-hidden />
          <h2 id="historia-heading" className="text-2xl font-bold text-[var(--epr-blue-800)]">
            Historia
          </h2>
        </div>
        <Card className="rounded-2xl border border-[var(--border)] bg-white">
          <CardContent className="space-y-4 p-6 text-sm text-slate-700 md:text-base">
            <p>
              El proyecto arranca identificando la necesidad de un canal único donde consultar eventos,
              comparar paquetes y completar la reserva sin perderse en mensajes dispersos o información
              desactualizada.
            </p>
            <p>
              Con el tiempo, EPR S.A. fue incorporando mejoras en la experiencia de usuario, integración de
              pagos y acompañamiento al asistente, siempre escuchando feedback de clientes y organizadores.
            </p>
            <p className="text-slate-600">
              Hoy seguimos evolucionando la plataforma para sumar nuevos eventos y mantener la confianza que
              nos distingue.
            </p>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="equipo-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="size-6 text-[var(--primary)]" aria-hidden />
          <h2 id="equipo-heading" className="text-2xl font-bold text-[var(--epr-blue-800)]">
            Equipo
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          Un grupo multidisciplinario trabaja detrás de cada reserva: operación, soporte y tecnología alineados
          con los mismos estándares de servicio.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {TEAM.map((member) => (
            <Card key={member.name} className="rounded-2xl border border-[var(--border)] bg-white">
              <CardContent className="p-5">
                <p className="font-semibold text-[var(--epr-blue-800)]">{member.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                  {member.role}
                </p>
                <p className="mt-3 text-sm text-slate-600">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="border-t border-[var(--border)] pt-8">
        <p className="text-sm text-slate-600">
          ¿Quieres hablar con nosotros?{" "}
          <Link href="/contact" className="font-semibold text-[var(--primary)] hover:underline">
            Ir a contacto
          </Link>
        </p>
      </div>
    </section>
  );
}
