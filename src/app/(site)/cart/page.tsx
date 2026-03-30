import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { fetchPublicEventById, fetchPublicTicketById } from "@/features/events/server/queries";
import { formatEventDayMonthEs, formatEventTimeAmPmEs, formatEventWeekdayDateEs } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

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
      <section className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-black text-[var(--epr-blue-800)]">Carrito</h1>
        <p className="text-sm text-slate-600">Selecciona un paquete para continuar.</p>
        <Link href="/packages" className={cn(buttonVariants({ variant: "primary", size: "md" }))}>
          Ir a Paquetes
        </Link>
      </section>
    );
  }

  const [event, ticket] = await Promise.all([
    fetchPublicEventById(eventId),
    fetchPublicTicketById(ticketTypeId)
  ]);

  if (!ticket || !event || ticket.eventId !== event.id || event.organizationId !== organizationId) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-black text-[var(--epr-blue-800)]">Carrito</h1>
      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--epr-blue-800)]">
            {formatEventDayMonthEs(event.startAt)}
          </p>
          <p className="text-lg font-black text-slate-900">{ticket.name}</p>
          <p className="text-sm text-slate-600">
            {formatEventWeekdayDateEs(event.startAt)} · Salida {formatEventTimeAmPmEs(event.startAt)}
          </p>
          <p className="text-sm text-slate-600">{event.location}</p>
          <p className="text-2xl font-black text-[var(--accent)]">${ticket.price.toFixed(0)}</p>
          <Link
            href={`/checkout?organizationId=${encodeURIComponent(organizationId)}&eventId=${encodeURIComponent(eventId)}&ticketTypeId=${encodeURIComponent(ticketTypeId)}`}
            className={cn(buttonVariants({ variant: "primary", size: "md" }), "w-full")}
          >
            Ir a checkout
          </Link>
          <Link
            href="/packages"
            className={cn(buttonVariants({ variant: "secondary", size: "md" }), "w-full")}
          >
            Seguir viendo paquetes
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
