import { z } from "zod";

export const checkoutFormSchema = z.object({
  organizationId: z.string().min(1),
  eventId: z.string().min(1),
  ticketTypeId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
  buyerName: z.string().min(3).max(120),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().min(7).max(20)
});

export const checkoutSchema = checkoutFormSchema.extend({
  quantity: z.coerce.number().int().min(1).max(10)
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
