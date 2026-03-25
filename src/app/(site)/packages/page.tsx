import { getEvents, getTicketsByEventId } from "@/features/events/data";
import { TicketCard } from "@/features/tickets/components/ticket-card";
import { formatEventDayMonthEs } from "@/lib/utils/date";

export default function PackagesPage(): JSX.Element {
  const tickets = getEvents().flatMap((event) => getTicketsByEventId(event.id));
  const firstTicketEvent = getEvents()[0];

  return (
    <section className="space-y-7">
      <div className="space-y-1">
        <div className="relative inline-block">
          <h1 className="text-4xl font-black tracking-tight text-[var(--epr-blue-800)] md:text-5xl">
            PAQUETES
          </h1>
          <div className="mt-1 h-1 w-32 bg-[var(--accent)]" />
        </div>
        <p className="text-sm font-semibold text-slate-600">
          {firstTicketEvent?.startAt ? formatEventDayMonthEs(firstTicketEvent.startAt) : "Fechas disponibles"}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </section>
  );
}
