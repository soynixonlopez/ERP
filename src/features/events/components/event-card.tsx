import Image from "next/image";
import Link from "next/link";
import { MapPin, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatEventDate } from "@/lib/utils/date";
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
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-[var(--epr-blue-800)]">{event.title}</h3>
          <Badge tone={isActive ? "success" : "warning"}>{badgeText}</Badge>
        </div>
        <p className="text-sm text-slate-600">{event.shortDescription}</p>
        <div className="space-y-1 text-sm text-slate-700">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[var(--primary)]" />
            {formatEventDate(event.startAt)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4 text-[var(--primary)]" />
            {event.location}
          </p>
        </div>
        {isActive ? (
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
