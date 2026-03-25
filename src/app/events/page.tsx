import { EventCard } from "@/features/events/components/event-card";
import { getEvents } from "@/features/events/data";

export default function EventsPage(): JSX.Element {
  const events = getEvents();

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Eventos</h1>
        <p className="text-slate-600">Descubre los eventos activos y reserva tus paquetes.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
