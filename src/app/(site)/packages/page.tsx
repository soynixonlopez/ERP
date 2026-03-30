import { fetchPublicTickets } from "@/features/events/server/queries";
import { TicketCard } from "@/features/tickets/components/ticket-card";
import { formatEventDayMonthEs } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export default async function PackagesPage(): Promise<JSX.Element> {
  const tickets = await fetchPublicTickets();
  const first = tickets[0];

  return (
    <section className="space-y-7">
      <div className="space-y-1">
        <div className="relative inline-block">
          <h1 className="text-4xl font-black tracking-tight text-[var(--epr-blue-800)] md:text-5xl">PAQUETES</h1>
          <div className="mt-1 h-1 w-32 bg-[var(--accent)]" />
        </div>
        <p className="text-sm font-semibold text-slate-600">
          {first?.eventStartAt ? formatEventDayMonthEs(first.eventStartAt) : "Fechas disponibles"}
        </p>
      </div>

      {tickets.length === 0 ? (
        <p className="rounded-2xl border border-[var(--border)] bg-white px-6 py-10 text-center text-sm text-slate-600">
          Aún no hay paquetes a la venta. Cuando el administrador publique entradas, aparecerán aquí automáticamente.
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </section>
  );
}
