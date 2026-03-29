export type ReservationItemForLabel = {
  quantity?: number;
  ticket_types?: { name?: string | null } | null;
};

export function packageLabelFromItems(items: ReservationItemForLabel[] | null | undefined): string {
  if (!items?.length) {
    return "—";
  }
  return items
    .map((ri) => {
      const name = ri.ticket_types?.name?.trim() || "Paquete";
      const q = Number(ri.quantity ?? 1);
      return q > 1 ? `${name} (×${q})` : name;
    })
    .join(", ");
}
