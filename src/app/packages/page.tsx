import { getEvents, getTicketsByEventId } from "@/features/events/data";
import { TicketCard } from "@/features/tickets/components/ticket-card";

export default function PackagesPage(): JSX.Element {
  const tickets = getEvents().flatMap((event) => getTicketsByEventId(event.id));

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Paquetes y entradas</h1>
        <p className="text-slate-600">Selecciona el paquete que mejor se ajuste a tu experiencia.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </section>
  );
}
