import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEvents, getTicketById } from "@/features/events/data";
import { formatEventDayMonthEs, formatEventTimeAmPmEs, formatEventWeekdayDateEs } from "@/lib/utils/date";

type PackageDetailPageProps = {
  params: Promise<{ ticketId: string }>;
};

export default async function PackageDetailPage({ params }: PackageDetailPageProps): Promise<JSX.Element> {
  const { ticketId } = await params;
  const ticket = getTicketById(ticketId);
  if (!ticket) notFound();

  const event = getEvents().find((e) => e.id === ticket.eventId);
  if (!event) notFound();

  const priceLabel = `$${ticket.price.toFixed(0)}`;

  return (
    <section className="mx-auto w-full max-w-2xl space-y-5">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--epr-blue-800)]/10">
              <Ticket className="size-6 text-[var(--epr-blue-800)]" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--epr-blue-800)]">
                {formatEventDayMonthEs(event.startAt)}
              </p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">
                {ticket.label} {priceLabel}
              </h1>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-[var(--primary)]" />
            <span>
              Salida: <span className="font-semibold text-slate-900">{formatEventTimeAmPmEs(event.startAt)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[var(--primary)]" />
            <span>
              {formatEventWeekdayDateEs(event.startAt)}
            </span>
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <MapPin className="size-4 text-[var(--primary)]" />
            <span className="font-semibold text-slate-900">{event.location}</span>
          </div>
        </div>

        <div className="mt-4 space-y-2 rounded-xl bg-[var(--epr-surface)] p-4 text-sm text-slate-700">
          <p>
            <span className="font-bold text-slate-900">{ticket.name}.</span>
          </p>
          <p className="text-slate-600">{ticket.benefits.join(" + ")}</p>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/cart?organizationId=${encodeURIComponent(event.organizationId)}&eventId=${encodeURIComponent(event.id)}&ticketTypeId=${encodeURIComponent(ticket.id)}`}
            className="w-full"
          >
            <Button size="lg" className="w-full">
              Comprar
            </Button>
          </Link>
          <Link href="/packages" className="w-full">
            <Button variant="secondary" size="lg" className="w-full">
              Volver a Paquetes
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

