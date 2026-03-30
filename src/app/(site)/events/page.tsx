import { EventCard } from "@/features/events/components/event-card";
import { fetchPublicEvents } from "@/features/events/server/queries";

export const dynamic = "force-dynamic";

export default async function EventsPage(): Promise<JSX.Element> {
  const events = await fetchPublicEvents();

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
      {events.length === 0 ? (
        <p className="rounded-2xl border border-[var(--border)] bg-white px-6 py-10 text-center text-sm text-slate-600">
          Pronto publicaremos nuevos eventos. Vuelve más tarde o contacta al equipo desde la sección de contacto.
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}
