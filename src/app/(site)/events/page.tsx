import { EventCard } from "@/features/events/components/event-card";
import { getEvents } from "@/features/events/data";

export default function EventsPage(): JSX.Element {
  const events = getEvents();

  return (
    <section className="space-y-7">
      <div className="space-y-2">
        <div className="relative inline-block">
          <h1 className="text-4xl font-black tracking-tight text-[var(--epr-blue-800)]">Eventos</h1>
          <div className="mt-1 h-1 w-20 bg-[var(--accent)]" />
        </div>
        <p className="text-sm font-semibold text-slate-600">
          Descubre los eventos activos y reserva tus paquetes.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
