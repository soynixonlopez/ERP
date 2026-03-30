import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, CalendarDays } from "lucide-react";
import { fetchPublicEventBySlug, fetchPublicTicketsForEvent } from "@/features/events/server/queries";
import { TicketCard } from "@/features/tickets/components/ticket-card";
import { formatEventDate } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const event = await fetchPublicEventBySlug(slug);
  if (!event) {
    notFound();
  }

  const tickets = await fetchPublicTicketsForEvent(event.id);
  const hasBanner = event.bannerUrl.trim().length > 0;

  return (
    <article className="space-y-8">
      <div className="relative h-64 overflow-hidden rounded-2xl bg-slate-200 md:h-96">
        {hasBanner ? (
          <Image src={event.bannerUrl} alt="" fill className="object-cover" priority sizes="100vw" />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <p className="text-lg font-bold text-[var(--epr-blue-800)]">Imagen próximamente</p>
          </div>
        )}
      </div>

      <section className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-[var(--epr-blue-800)] md:text-5xl">{event.title}</h1>
        <p className="max-w-4xl text-slate-600">{event.description}</p>
        <div className="space-y-1 text-sm text-slate-700">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[var(--primary)]" />
            {formatEventDate(event.startAt)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4 text-[var(--primary)]" />
            {event.location}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="relative inline-block">
          <h2 className="text-3xl font-black text-[var(--epr-blue-800)]">Paquetes y entradas</h2>
          <div className="mt-1 h-1 w-28 bg-[var(--accent)]" />
        </div>
        {tickets.length === 0 ? (
          <p className="text-sm text-slate-600">Los paquetes para este evento se publicarán pronto.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </section>
    </article>
  );
}
