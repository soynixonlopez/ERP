"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketCard } from "@/features/tickets/components/ticket-card";
import type { TicketTypeData } from "@/features/events/types";

type TicketCarouselProps = {
  tickets: TicketTypeData[];
};

const ITEMS_PER_PAGE = 3;

export function TicketCarousel({ tickets }: TicketCarouselProps): React.JSX.Element {
  const sortedTickets = useMemo(
    () => [...tickets].sort((a, b) => a.price - b.price),
    [tickets]
  );

  const pages = useMemo(() => {
    const chunks: TicketTypeData[][] = [];
    for (let i = 0; i < sortedTickets.length; i += ITEMS_PER_PAGE) {
      chunks.push(sortedTickets.slice(i, i + ITEMS_PER_PAGE));
    }
    return chunks;
  }, [sortedTickets]);

  const [page, setPage] = useState(0);
  const canPrev = page > 0;
  const canNext = page < pages.length - 1;
  const visibleTickets = pages[page] ?? [];

  if (sortedTickets.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border)] bg-white px-6 py-10 text-center text-sm text-slate-600">
        Cuando haya paquetes publicados para el evento destacado, aparecerán aquí en carrusel.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Movil y tablet: lista vertical */}
      <div className="flex flex-col gap-5 lg:hidden">
        {sortedTickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>

      {/* Desktop: 3 por vista con flechas */}
      <div className="hidden lg:block">
        <div className="grid gap-5 md:grid-cols-3">
          {visibleTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>

        {pages.length > 1 ? (
          <div className="mt-4 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={!canPrev}
              aria-label="Ver paquetes anteriores"
              className="h-11 w-11 rounded-full p-0"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={() => setPage((prev) => Math.min(pages.length - 1, prev + 1))}
              disabled={!canNext}
              aria-label="Ver siguientes paquetes"
              className="h-11 w-11 rounded-full p-0"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
