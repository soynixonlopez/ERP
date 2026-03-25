export const RESERVATION_STATUSES = [
  "draft",
  "pending_payment",
  "confirmed",
  "cancelled",
  "expired",
  "refunded"
] as const;

export const PAYMENT_STATUSES = [
  "pending",
  "processing",
  "paid",
  "failed",
  "refunded",
  "partially_refunded"
] as const;

export const ORGANIZATION_ROLES = ["owner", "admin", "staff", "viewer"] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];
