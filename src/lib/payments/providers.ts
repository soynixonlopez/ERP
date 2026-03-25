export const paymentProviders = ["stripe", "paypal", "cybersource", "yappy", "manual"] as const;

export type PaymentProvider = (typeof paymentProviders)[number];
