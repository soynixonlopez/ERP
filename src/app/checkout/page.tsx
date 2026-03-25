import { Card, CardContent } from "@/components/ui/card";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { getEvents, getTicketsByEventId } from "@/features/events/data";

export default function CheckoutPage(): JSX.Element {
  const event = getEvents()[0];
  const ticket = getTicketsByEventId(event.id)[0];

  return (
    <section className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
      <Card>
        <CardContent className="space-y-3">
          <h1 className="text-2xl font-black text-slate-900">Checkout</h1>
          <p className="text-sm text-slate-600">Verificacion server-side de disponibilidad y creacion segura.</p>
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold">{event.title}</p>
            <p>{ticket.name}</p>
            <p>Precio: ${ticket.price.toFixed(2)} USD</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
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
