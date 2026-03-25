import { z } from "zod";

export const adminEventSchema = z.object({
  organizationId: z.uuid(),
  title: z.string().min(3).max(160),
  slug: z
    .string()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug invalido"),
  description: z.string().min(10).max(5000),
  shortDescription: z.string().min(10).max(500).optional(),
  location: z.string().min(3).max(240),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  status: z.enum(["draft", "published", "sold_out", "cancelled"])
});

export const adminEventUpdateSchema = adminEventSchema.partial().extend({
  organizationId: z.uuid(),
  id: z.uuid()
});

export type AdminEventInput = z.infer<typeof adminEventSchema>;
