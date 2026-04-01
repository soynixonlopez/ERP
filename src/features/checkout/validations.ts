import { z } from "zod";

type CheckoutRefineData = { quantity: number; guestNames: string[] };

const guestPartyRefine = (data: CheckoutRefineData, ctx: z.core.$RefinementCtx<CheckoutRefineData>): void => {
  if (data.quantity > 1) {
    const need = data.quantity - 1;
    if (data.guestNames.length !== need) {
      ctx.addIssue({
        code: "custom",
        message: `Indique el nombre completo de ${need} acompañante(s).`,
        path: ["guestNames"]
      });
      return;
    }
    data.guestNames.forEach((name, i) => {
      if (name.trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Mínimo 2 caracteres",
          path: ["guestNames", i]
        });
      }
    });
  } else if (data.guestNames.length > 0) {
    ctx.addIssue({
      code: "custom",
      message: "Con una sola entrada no hacen falta acompañantes.",
      path: ["guestNames"]
    });
  }
};

const checkoutShape = {
  organizationId: z.string().min(1),
  eventId: z.string().min(1),
  ticketTypeId: z.string().min(1),
  buyerName: z.string().min(3).max(120),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().min(7).max(20),
  buyerCountry: z.string().min(2).max(80),
  guestNames: z.array(z.string().max(120)).max(9)
};

export const checkoutFormSchema = z
  .object({
    ...checkoutShape,
    quantity: z.number().int().min(1).max(10),
    buyerAge: z.number().int().min(1).max(120)
  })
  .superRefine(guestPartyRefine);

export const checkoutSchema = z
  .object({
    ...checkoutShape,
    quantity: z.coerce.number().int().min(1).max(10),
    buyerAge: z.coerce.number().int().min(1).max(120)
  })
  .superRefine(guestPartyRefine);

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
