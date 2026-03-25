import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getManualPaymentConfig } from "@/lib/config/manual-payments";

type CheckoutConfirmationProps = {
  searchParams: Promise<{ reservation?: string }>;
};

export default async function CheckoutConfirmationPage({
  searchParams
}: CheckoutConfirmationProps): Promise<JSX.Element> {
  const params = await searchParams;
  const payment = getManualPaymentConfig();
  const message = encodeURIComponent(
    `Hola EPR, ya realice el pago de mi reserva ${params.reservation ?? ""}. Adjunto comprobante.`
  );
  const whatsappProofUrl = payment.whatsappUrl
    ? `${payment.whatsappUrl}?text=${message}`
    : "";

  return (
    <section className="mx-auto w-full max-w-3xl space-y-5 rounded-2xl border border-[var(--border)] bg-white p-6 md:p-8">
      <div className="rounded-2xl bg-[var(--epr-blue-800)] p-6 text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-white/95">
          Reserva pendiente de pago
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">Tu solicitud fue registrada</h1>
        <p className="mt-4 text-white/90">
          Numero de reserva:{" "}
          <span className="font-semibold text-white">{params.reservation ?? "pendiente"}</span>
        </p>
      </div>

      <div className="grid gap-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-2">
        <div className="space-y-1">
          <p className="font-bold text-slate-900">Pago por transferencia bancaria</p>
          <p>Banco: {payment.bankName}</p>
          <p>Cuenta: {payment.bankAccountNumber}</p>
          <p>Titular: {payment.bankAccountName}</p>
        </div>
        <div className="space-y-1">
          <p className="font-bold text-slate-900">Pago por Yappy</p>
          <p>Numero: {payment.yappyNumber}</p>
          <p>Referencia sugerida: {params.reservation ?? "RSV"}</p>
        </div>
      </div>

      <div className="space-y-2 text-center">
        <p className="text-sm text-slate-600">
          Cuando hagas el pago, envia el comprobante por WhatsApp para validacion del equipo admin.
        </p>
        {whatsappProofUrl ? (
          <Link href={whatsappProofUrl} target="_blank">
            <Button size="lg" className="w-full md:w-auto">
              Enviar comprobante por WhatsApp
            </Button>
          </Link>
        ) : (
          <p className="text-xs text-red-600">Configura `NEXT_PUBLIC_WHATSAPP_NUMBER` para habilitar el boton.</p>
        )}
      </div>
    </section>
  );
}
