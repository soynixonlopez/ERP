import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TicketTypeData } from "@/features/events/types";

type TicketCardProps = {
  ticket: TicketTypeData;
};

export function TicketCard({ ticket }: TicketCardProps): JSX.Element {
  const available = ticket.inventory - ticket.sold;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">{ticket.name}</h3>
          <Badge tone={available > 0 ? "success" : "danger"}>{ticket.label}</Badge>
        </div>
        <p className="text-2xl font-black text-[var(--primary)]">${ticket.price.toFixed(2)}</p>
        <ul className="space-y-1 text-sm text-slate-600">
          {ticket.benefits.map((benefit) => (
            <li key={benefit}>- {benefit}</li>
          ))}
        </ul>
        <p className="text-xs font-medium text-slate-500">Cupos disponibles: {available}</p>
        <Button className="w-full" disabled={available <= 0}>
          {available > 0 ? "Reservar paquete" : "Agotado"}
        </Button>
      </CardContent>
    </Card>
  );
}
