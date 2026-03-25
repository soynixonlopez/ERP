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

export function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
