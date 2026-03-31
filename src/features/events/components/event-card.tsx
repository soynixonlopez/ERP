import Image from "next/image";
import Link from "next/link";
import { MapPin, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatEventSchedule } from "@/lib/utils/date";
import type { EventCardData } from "@/features/events/types";

type EventCardProps = {
  event: EventCardData;
};

export function EventCard({ event }: EventCardProps): JSX.Element {
  const isActive = event.status === "published";
  const hasBanner = event.bannerUrl.trim().length > 0;
  const badgeText =
    event.status === "published"
      ? "Activo"
      : event.status === "upcoming"
        ? "Próximamente"
        : event.status === "sold_out"
          ? "Agotado"
          : event.status;

  return (
    <Card className="overflow-hidden rounded-2xl border border-[var(--border)]">
      {hasBanner ? (
        <div className="relative h-44 w-full">
          <Image src={event.bannerUrl} alt={event.title} fill className="object-cover" />
        </div>
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-slate-100 px-6 text-center">
          <p className="text-lg font-bold text-[var(--epr-blue-800)]">Próximamente</p>
        </div>
      )}
      <CardContent className="space-y-3">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 pr-2 text-lg font-bold leading-snug text-[var(--epr-blue-800)] break-words">
            {event.title}
          </h3>
          <Badge className="shrink-0" tone={isActive ? "success" : "warning"}>
            {badgeText}
          </Badge>
        </div>
        <p className="text-sm text-slate-600">{event.shortDescription}</p>
        <div className="space-y-1 text-sm text-slate-700">
          <p className="flex min-w-0 items-start gap-2">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" />
            <span className="min-w-0 break-words">{formatEventSchedule(event.startAt, event.endAt)}</span>
          </p>
          <p className="flex min-w-0 items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" />
            <span className="min-w-0 break-words">{event.location}</span>
          </p>
        </div>
        {isActive || event.status === "sold_out" ? (
          <Link href={`/events/${event.slug}`}>
            <Button className="w-full">Ver detalle</Button>
          </Link>
        ) : (
          <Link href="/contact">
            <Button className="w-full" variant="secondary">
              Quiero enterarme
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
