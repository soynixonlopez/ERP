import { z } from "zod";

export const adminTicketSchema = z.object({
  organizationId: z.uuid(),
  eventId: z.uuid(),
  name: z.string().min(3).max(160),
  description: z.string().max(1500).optional(),
  badgeLabel: z.string().max(32).optional(),
  price: z.coerce.number().min(0),
  inventory: z.coerce.number().int().min(0),
  minPerOrder: z.coerce.number().int().min(1).max(50).default(1),
  maxPerOrder: z.coerce.number().int().min(1).max(50).default(10),
  sortOrder: z.coerce.number().int().min(0).default(0),
  visibility: z.enum(["public", "hidden"]),
  isActive: z.coerce.boolean().default(true)
});

export const adminTicketUpdateSchema = adminTicketSchema.partial().extend({
  organizationId: z.uuid(),
  id: z.uuid()
});
