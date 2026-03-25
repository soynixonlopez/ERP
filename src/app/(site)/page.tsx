import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketCard } from "@/features/tickets/components/ticket-card";
import { getEvents, getTicketsByEventId } from "@/features/events/data";
import { formatEventDate } from "@/lib/utils/date";
import type { TicketTypeData } from "@/features/events/types";

export default function HomePage(): JSX.Element {
  const events = getEvents();
  const featured = events[0];
  const featuredTickets = getTicketsByEventId(featured.id);
  const featuredTicketList: TicketTypeData[] = featuredTickets;

  return (
    <div className="space-y-10">
      {/* Hero principal */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--epr-blue-900)]">
        <div className="relative min-h-[22rem] h-[min(70vh,36rem)] sm:min-h-[26rem] md:h-[30rem] md:min-h-0">
          <Image src={featured.bannerUrl} alt={featured.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--epr-blue-900)]/20 via-[var(--epr-blue-900)]/60 to-[var(--epr-blue-900)]" />

          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-10">
            <div className="max-w-2xl space-y-4 sm:space-y-5">
              <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/95">
                Summer Beats 2026
              </p>

              <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--accent)] sm:text-4xl md:text-6xl">
                {featured.title}
              </h1>

              <p className="text-sm leading-relaxed text-white/90 md:text-base">{featured.shortDescription}</p>

              <div className="space-y-2 text-sm text-white/90">
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-[var(--accent)]" />
                  {formatEventDate(featured.startAt)}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-[var(--accent)]" />
                  {featured.location}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href={`/events/${featured.slug}`} className="w-full sm:w-auto">
                  <Button size="lg" variant="accent" className="w-full sm:w-auto">
                    Me interesa <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <Link href="/packages" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-white/15 text-white hover:bg-white/20 sm:w-auto" variant="secondary">
                    Ver paquetes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Paquetes destacados */}
      <section className="space-y-5">
        <div className="relative inline-block">
          <h2 className="epr-section-title !text-3xl text-[var(--epr-blue-800)]">
            Paquetes
          </h2>
          <div className="mt-1 h-1 w-24 bg-[var(--accent)]" />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featuredTicketList.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </section>
      {/* Qué es Summer Beats 2026 */}
      <section className="space-y-5 pt-3">
        <div className="relative inline-block">
          <h2 className="epr-section-title !text-3xl !text-[var(--epr-blue-800)]">Qué es Summer Beats 2026</h2>
          <div className="mt-1 h-1 w-40 bg-[var(--accent)]" />
        </div>

        <div className="grid gap-5 md:grid-cols-2 md:items-start">
          <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-white p-6 md:h-[360px]">
            <p className="text-sm font-semibold text-[var(--epr-blue-800)]">{featured.shortDescription}</p>
            <p className="mt-3 text-sm text-slate-600">{featured.description}</p>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 text-[var(--primary)]" />
                <p className="text-sm text-slate-700">Tarimas y zonas pensadas para vivir cada momento.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 text-[var(--primary)]" />
                <p className="text-sm text-slate-700">Acceso organizado para que tu entrada sea rápida.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 text-[var(--primary)]" />
                <p className="text-sm text-slate-700">Paquetes con beneficios claros desde el inicio.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 text-[var(--primary)]" />
                <p className="text-sm text-slate-700">Acceso por franjas para una entrada fluida.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 text-[var(--primary)]" />
                <p className="text-sm text-slate-700">Experiencias pensadas para disfrutar sin preocupaciones.</p>
              </div>
            </div>

            <p className="mt-5 text-sm text-slate-600">
              Elige tu paquete, reserva en minutos y nosotros nos encargamos del resto.
            </p>
          </div>

          <div className="relative h-[280px] overflow-hidden rounded-2xl bg-[var(--epr-blue-900)] md:h-[360px]">
            <Image
              src={featured.bannerUrl}
              alt={featured.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/90">
                Fecha y ubicación
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-tight">{formatEventDate(featured.startAt)}</h3>
              <div className="mt-2 flex items-center gap-2 text-sm text-white/90">
                <MapPin className="size-4 text-[var(--accent)]" />
                <span className="font-semibold">{featured.location}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Por qué reservar este evento */}
      <section className="space-y-5 pt-3">
        <div className="relative inline-block">
          <h2 className="epr-section-title !text-3xl !text-[var(--epr-blue-800)]">Por qué reservar este evento</h2>
          <div className="mt-1 h-1 w-56 bg-[var(--accent)]/90" />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                <CalendarDays className="size-5 text-[var(--primary)]" />
              </span>
              <p className="text-sm font-semibold text-[var(--epr-blue-800)]">Compra simple</p>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Elige tu paquete, confirma tu compra y recibe tu reserva sin complicaciones.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                <ShieldCheck className="size-5 text-[var(--primary)]" />
              </span>
              <p className="text-sm font-semibold text-[var(--epr-blue-800)]">Confirmación segura</p>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Verificación server-side y proceso controlado para que todo salga bien.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                <Phone className="size-5 text-[var(--primary)]" />
              </span>
              <p className="text-sm font-semibold text-[var(--epr-blue-800)]">Te acompañamos</p>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Si tienes dudas, te guiamos antes del evento para que llegues tranquilo.
            </p>
          </div>
        </div>
      </section>

      {/* CTA contacto / paquetes */}
      <section className="pt-3" aria-label="Contacto y paquetes">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--epr-blue-900)] shadow-md">
          <div className="flex flex-col gap-8 p-6 sm:p-8 md:flex-row md:items-center md:justify-between md:gap-10 lg:p-10">
            <div className="max-w-xl space-y-2 md:space-y-3">
              <p className="text-sm font-semibold text-[var(--accent)]">Hablemos ahora</p>
              <h3 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                ¿Listo para reservar?
              </h3>
              <p className="text-sm leading-relaxed text-white/90 md:text-base">
                Escríbenos por WhatsApp o revisa la información de contacto. También puedes ver los
                paquetes disponibles cuando quieras.
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:items-center md:w-auto md:flex-col lg:flex-row">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button size="lg" variant="accent" className="w-full min-w-[11rem] shadow-sm">
                  Ir a Contacto
                </Button>
              </Link>
              <Link href="/packages" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full min-w-[11rem] border-2 border-white/50 text-white hover:bg-white/10"
                >
                  Ver paquetes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
