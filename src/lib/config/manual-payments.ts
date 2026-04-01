export function getManualPaymentConfig() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

  return {
    bankAccountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "EPR S.A.",
    bankName: process.env.NEXT_PUBLIC_BANK_NAME ?? "Banco General",
    bankAccountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "000-000-0000",
    yappyNumber: process.env.NEXT_PUBLIC_YAPPY_NUMBER ?? "+50760000000",
    whatsappNumber,
    whatsappUrl: whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : ""
  };
}

const DEFAULT_APP_URL = "http://localhost:3000";

/**
 * URL pública de la app (emails, QR, enlaces absolutos).
 * Si en .env hay varias URLs separadas por coma (error común), se usa la primera válida.
 */
export function getAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return DEFAULT_APP_URL;

  const candidates = raw
    .split(/[,\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const c of candidates) {
    try {
      const u = new URL(c);
      if (u.protocol === "http:" || u.protocol === "https:") {
        return u.origin;
      }
    } catch {
      /* siguiente candidato */
    }
  }

  return DEFAULT_APP_URL;
}
