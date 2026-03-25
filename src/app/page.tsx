import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/features/events/components/event-card";
import { TicketCard } from "@/features/tickets/components/ticket-card";
import { getEvents, getTicketsByEventId } from "@/features/events/data";
import { formatEventDate } from "@/lib/utils/date";

export default function HomePage(): JSX.Element {
  const events = getEvents();
  const featured = events[0];
  const featuredTickets = getTicketsByEventId(featured.id);

  return (
    <div className="space-y-12">
      <section className="grid items-center gap-6 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-2 md:p-8">
        <div className="space-y-4">
          <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            Experiencia premium EPR
          </p>
          <h1 className="text-3xl font-black text-slate-900 md:text-5xl">{featured.title}</h1>
          <p className="text-slate-600">{featured.description}</p>
          <div className="space-y-1 text-sm text-slate-700">
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4 text-[var(--primary)]" />
              {formatEventDate(featured.startAt)}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-[var(--primary)]" />
              {featured.location}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/events/${featured.slug}`}>
              <Button size="lg">
                Me interesa <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href="/events">
              <Button size="lg" variant="secondary">
                Ver todos los eventos
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative h-64 overflow-hidden rounded-xl md:h-96">
          <Image src={featured.bannerUrl} alt={featured.title} fill className="object-cover" priority />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">Eventos destacados</h2>
          <Link href="/events" className="text-sm font-semibold text-[var(--primary)]">
            Explorar mas
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Paquetes disponibles</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {featuredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </section>
    </div>
  );
}
