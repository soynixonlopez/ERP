import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TicketTypeData } from "@/features/events/types";
import { formatEventDayMonthEs } from "@/lib/utils/date";
import Link from "next/link";
import { getEvents } from "@/features/events/data";
import Image from "next/image";

type TicketCardProps = {
  ticket: TicketTypeData;
};

export function TicketCard({ ticket }: TicketCardProps): JSX.Element {
  const available = ticket.inventory - ticket.sold;
  const event = getEvents().find((e) => e.id === ticket.eventId);

  const packageTone =
    ticket.label === "VIP"
      ? "text-[var(--accent)]"
      : ticket.label === "PLATINO"
        ? "text-[var(--accent)]"
        : ticket.label === "GENERAL"
          ? "text-emerald-500"
          : "text-[var(--primary)]";

  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
      <div className="relative h-44 w-full md:h-48">
        <Image
          src="/assets/imagenes/BannerEventoTaboga.png"
          alt={`Banner ${ticket.label}`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
      </div>

      <CardContent className="flex flex-col space-y-4 p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-black tracking-widest text-[var(--epr-blue-800)]">
              {event?.startAt ? formatEventDayMonthEs(event.startAt) : "FECHA"}
            </p>
            <h3 className="text-base font-black text-slate-900">{ticket.name}</h3>
          </div>

          <div className="shrink-0 text-right">
            <p className={`text-sm font-black uppercase ${packageTone}`}>{ticket.label}</p>
            <p className="text-2xl font-black text-[var(--accent)] sm:text-3xl">${ticket.price.toFixed(0)} </p>
          </div>
        </div>

        <p className="text-sm text-slate-600">{ticket.benefits.slice(0, 2).join(" + ")}</p>

        <Link href={`/packages/${ticket.id}`} className="block">
          <Button className="w-full" variant={available > 0 ? "primary" : "secondary"} disabled={available <= 0}>
            {available > 0 ? "Comprar paquete" : "Agotado"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
