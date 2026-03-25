import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getEvents, getTicketById } from "@/features/events/data";
import { formatEventDayMonthEs, formatEventTimeAmPmEs } from "@/lib/utils/date";

type CheckoutPageProps = {
  searchParams: Promise<{
    organizationId?: string;
    eventId?: string;
    ticketTypeId?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps): Promise<JSX.Element> {
  const params = await searchParams;
  const { organizationId, eventId, ticketTypeId } = params;

  if (!organizationId || !eventId || !ticketTypeId) {
    redirect("/packages");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const event = getEvents().find((e) => e.id === eventId);
  const ticket = getTicketById(ticketTypeId);

  if (!event || !ticket) redirect("/packages");

  return (
    <section className="mx-auto grid w-full max-w-4xl gap-6 lg:grid-cols-2">
      <Card>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[var(--epr-blue-800)]">
              Checkout
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">Confirma tu reserva</h1>
          </div>

          <div className="rounded-xl bg-[var(--epr-surface)] p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">{event.title}</p>
            <p className="text-slate-600">{ticket.name}</p>
            <div className="mt-2 space-y-1">
              <p>
                Fecha: <span className="font-semibold">{formatEventDayMonthEs(event.startAt)}</span>
              </p>
              <p>
                Salida: <span className="font-semibold">{formatEventTimeAmPmEs(event.startAt)}</span>
              </p>
              <p className="font-semibold">
                Precio: ${ticket.price.toFixed(0)} USD
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0 md:p-5">
          <CheckoutForm
            organizationId={event.organizationId}
            eventId={event.id}
            ticketTypeId={ticket.id}
          />
        </CardContent>
      </Card>
    </section>
  );
}
