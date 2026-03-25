import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEvents, getTicketById } from "@/features/events/data";
import { formatEventDayMonthEs, formatEventTimeAmPmEs, formatEventWeekdayDateEs } from "@/lib/utils/date";

type CartPageProps = {
  searchParams: Promise<{
    organizationId?: string;
    eventId?: string;
    ticketTypeId?: string;
  }>;
};

export default async function CartPage({ searchParams }: CartPageProps): Promise<JSX.Element> {
  const params = await searchParams;
  const { organizationId, eventId, ticketTypeId } = params;

  if (!ticketTypeId || !eventId || !organizationId) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-5">
        <h1 className="text-3xl font-black text-[var(--epr-blue-800)]">TU CARRITO</h1>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-slate-600">Tu carrito está vacío.</p>
          <div className="mt-4">
            <Link href="/packages">
              <Button size="lg" className="w-full">
                Ir a Paquetes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const ticket = getTicketById(ticketTypeId);
  const event = getEvents().find((e) => e.id === eventId);

  if (!ticket || !event) notFound();

  const priceLabel = `$${ticket.price.toFixed(0)}`;

  return (
    <section className="mx-auto w-full max-w-2xl space-y-5">
      {/* Acciones */}
      <div className="flex flex-col gap-3">
        <Link
          href={`/checkout?organizationId=${encodeURIComponent(organizationId)}&eventId=${encodeURIComponent(eventId)}&ticketTypeId=${encodeURIComponent(ticket.id)}`}
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

      <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900">TU CARRITO</h1>
            <p className="text-sm text-slate-600">Por favor confirma los detalles de tu compra</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--epr-blue-800)]/10">
            <Ticket className="size-5 text-[var(--epr-blue-800)]" />
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[var(--border)] bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-black tracking-widest text-[var(--epr-blue-800)]">
                {formatEventDayMonthEs(event.startAt)}
              </p>
              <p className="text-sm font-black text-slate-900">
                {ticket.label} · {priceLabel}
              </p>
            </div>
            <p className="text-sm font-semibold text-[var(--primary)]">1 paquete</p>
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-[var(--primary)]" />
              <span>
                Salida: <span className="font-semibold text-slate-900">{formatEventTimeAmPmEs(event.startAt)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-[var(--primary)]" />
              <span>{formatEventWeekdayDateEs(event.startAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-[var(--primary)]" />
              <span className="font-semibold text-slate-900">{event.location}</span>
            </div>
            <p className="text-slate-600">{ticket.name}. {ticket.benefits.join(" + ")}</p>
          </div>
        </div>

        <div className="mt-5">
          <Link href="/packages">
            <Button variant="secondary" size="lg" className="w-full">
              Eliminar
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

