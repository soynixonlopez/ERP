import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketCarousel } from "@/features/tickets/components/ticket-carousel";
import { fetchFeaturedHomepageBundle, fetchPublicTickets } from "@/features/events/server/queries";
import { formatEventTimeAmPmEs, formatEventWeekdayDateEs } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export default async function HomePage(): Promise<JSX.Element> {
  const bundle = await fetchFeaturedHomepageBundle();
  const allTickets = await fetchPublicTickets();
  const featured = bundle?.event ?? null;
  const hp = bundle?.parsed.homepage ?? {};
  const featuredTickets = featured ? allTickets.filter((t) => t.eventId === featured.id) : [];

  const heroTitle = hp.heroTitle?.trim() || featured?.title || "Próximos eventos";
  const heroSubtitle =
    hp.heroSubtitle?.trim() ||
    (featured
      ? "Reserva tus paquetes y vive la experiencia."
      : "Consulta eventos y paquetes disponibles cuando estén publicados.");
  const heroImage = hp.heroImage?.trim() || featured?.bannerUrl?.trim() || "";
  const dateLine =
    hp.dateLine?.trim() ||
    (featured ? `${formatEventWeekdayDateEs(featured.startAt)} · ${formatEventTimeAmPmEs(featured.startAt)}` : "");
  const locationLine = hp.locationLine?.trim() || featured?.location?.trim() || "";

  const storyTitle = hp.storyTitle?.trim() || (featured ? `Qué es ${featured.title}` : "");
  const storyLead =
    hp.storyLead?.trim() || featured?.shortDescription?.trim() || featured?.description?.slice(0, 160) || "";
  const storyBody = hp.storyBody?.trim() || "";
  const storyBullets = hp.storyBullets?.length ? hp.storyBullets : [];
  const storyImage = hp.storyImage?.trim() || featured?.bannerUrl?.trim() || "";
  const artists = hp.artistImages?.filter(Boolean) ?? [];

  const eventHref = featured ? `/events/${featured.slug}` : "/events";
  const packagesHref = "/packages";

  return (
    <div className="space-y-14 md:space-y-16">
      <section className="relative overflow-hidden rounded-2xl bg-[var(--epr-blue-900)]">
        <div className="relative min-h-[22rem] h-[min(70vh,36rem)] sm:min-h-[26rem] md:h-[30rem] md:min-h-0">
          {heroImage ? (
            <Image
              src={heroImage}
              alt=""
              fill
              className="object-cover object-[center_72%] md:object-[center_68%]"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--epr-blue-900)] via-slate-800 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--epr-blue-900)]/5 via-[var(--epr-blue-900)]/35 to-[var(--epr-blue-900)]/80" />

          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-10">
            <div className="max-w-2xl space-y-4 sm:space-y-5">
              <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--accent)] [text-shadow:0_2px_14px_rgba(0,0,0,0.65)] sm:text-4xl md:text-6xl">
                {heroTitle}
              </h1>

              <p className="text-sm leading-relaxed text-white/95 [text-shadow:0_1px_10px_rgba(0,0,0,0.65)] md:text-base">
                {heroSubtitle}
              </p>

              {(dateLine || locationLine) && (
                <div className="space-y-2 text-sm text-white/95 [text-shadow:0_1px_8px_rgba(0,0,0,0.65)]">
                  {dateLine ? (
                    <p className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-[var(--accent)]" />
                      {dateLine}
                    </p>
                  ) : null}
                  {locationLine ? (
                    <p className="flex items-center gap-2">
                      <MapPin className="size-4 text-[var(--accent)]" />
                      {locationLine}
                    </p>
                  ) : null}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href={eventHref} className="w-full sm:w-auto">
                  <Button size="lg" variant="accent" className="w-full sm:w-auto">
                    {featured ? "Me interesa" : "Ver eventos"} <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <Link href={packagesHref} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full bg-white/15 text-white hover:bg-white/20 sm:w-auto"
                    variant="secondary"
                  >
                    Ver paquetes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="relative inline-block">
          <h2 className="epr-section-title !text-3xl !text-[var(--epr-blue-800)]">Paquetes</h2>
          <div className="mt-1 h-1 w-24 bg-[var(--accent)]" />
        </div>

        <TicketCarousel tickets={featuredTickets} />
      </section>

      {featured && (storyTitle || storyLead || storyBody || storyBullets.length > 0 || storyImage) ? (
        <section className="space-y-5 pt-6 md:pt-8">
          <div className="relative inline-block">
            <h2 className="epr-section-title !text-3xl !text-[var(--epr-blue-800)]">
              {storyTitle || "El evento"}
            </h2>
            <div className="mt-1 h-1 w-40 bg-[var(--accent)]" />
          </div>

          <div className="grid gap-5 md:grid-cols-2 md:items-start">
            <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-white p-6 md:h-[360px]">
              {storyLead ? (
                <p className="text-sm font-semibold text-[var(--epr-blue-800)]">{storyLead}</p>
              ) : null}
              {storyBody ? <p className="mt-3 text-sm text-slate-600">{storyBody}</p> : null}

              {storyBullets.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {storyBullets.map((line, i) => (
                    <div key={`${i}-${line.slice(0, 24)}`} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 size-5 text-[var(--primary)]" />
                      <p className="text-sm text-slate-700">{line}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              <Link href={packagesHref} className="mt-5 w-full sm:w-auto">
                <Button size="lg" variant="accent" className="w-full sm:w-auto">
                  Elige tu paquete
                </Button>
              </Link>
            </div>

            <div className="relative h-[280px] overflow-hidden rounded-3xl md:h-[360px] bg-slate-100">
              {storyImage ? (
                <Image
                  src={storyImage}
                  alt=""
                  fill
                  className="object-cover rounded-3xl"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold text-slate-500">
                  Añade imagen de la sección desde el panel admin (evento destacado).
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-5 pt-6 md:pt-8">
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

      {artists.length > 0 ? (
        <section className="space-y-5 pt-6 md:pt-8">
          <div className="relative inline-block">
            <h2 className="epr-section-title !text-3xl !text-[var(--epr-blue-800)]">Artistas invitados</h2>
            <div className="mt-1 h-1 w-40 bg-[var(--accent)]" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((src, i) => (
              <Image
                key={`${src}-${i}`}
                src={src}
                alt=""
                width={900}
                height={1200}
                className="h-[28rem] w-full rounded-3xl object-cover md:h-[25rem] lg:h-[26rem]"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="pt-6 md:pt-8" aria-label="Contacto y paquetes">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--epr-blue-900)] shadow-md">
          <div className="flex flex-col gap-8 p-6 sm:p-8 md:flex-row md:items-center md:justify-between md:gap-10 lg:p-10">
            <div className="max-w-xl space-y-2 md:space-y-3">
              <p className="text-sm font-semibold text-[var(--accent)]">Hablemos ahora</p>
              <h3 className="text-3xl font-black tracking-tight text-white md:text-4xl">¿Listo para reservar?</h3>
              <p className="text-sm leading-relaxed text-white/90 md:text-base">
                Escríbenos por WhatsApp o revisa la información de contacto. También puedes ver los paquetes
                disponibles cuando quieras.
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:items-center md:w-auto md:flex-col lg:flex-row">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button size="lg" variant="accent" className="w-full min-w-[11rem] shadow-sm">
                  Ir a Contacto
                </Button>
              </Link>
              <Link href={packagesHref} className="w-full sm:w-auto">
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
