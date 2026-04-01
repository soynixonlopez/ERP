"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkoutFormSchema, type CheckoutFormInput } from "@/features/checkout/validations";

const SUGGESTED_COUNTRIES = [
  "Panamá",
  "Costa Rica",
  "Nicaragua",
  "Honduras",
  "El Salvador",
  "Guatemala",
  "Belice",
  "Colombia",
  "Venezuela",
  "Ecuador",
  "Perú",
  "Brasil",
  "Argentina",
  "Chile",
  "Uruguay",
  "Paraguay",
  "Bolivia",
  "México",
  "Estados Unidos",
  "Canadá",
  "España",
  "República Dominicana",
  "Cuba",
  "Puerto Rico",
  "Jamaica",
  "Otro / especificar abajo"
];

type CheckoutFormProps = {
  organizationId: string;
  eventId: string;
  ticketTypeId: string;
};

export function CheckoutForm({
  organizationId,
  eventId,
  ticketTypeId
}: CheckoutFormProps): JSX.Element {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      organizationId,
      eventId,
      ticketTypeId,
      quantity: 1,
      buyerName: "",
      buyerEmail: "",
      buyerPhone: "",
      buyerCountry: "",
      buyerAge: 25,
      guestNames: []
    }
  });

  const quantity = useWatch({ control: form.control, name: "quantity" });
  const guestsNeeded = Math.max(0, quantity - 1);

  useEffect(() => {
    const cur = form.getValues("guestNames") ?? [];
    if (cur.length === guestsNeeded) return;
    const next = cur.slice(0, guestsNeeded);
    while (next.length < guestsNeeded) next.push("");
    form.setValue("guestNames", next, { shouldValidate: false });
  }, [guestsNeeded, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    const response = await fetch("/api/checkout/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const raw = await response.text();
    let payload: { error?: string; reservationNumber?: string } = {};
    if (raw.trim()) {
      try {
        payload = JSON.parse(raw) as typeof payload;
      } catch {
        setServerError(
          `Respuesta invalida del servidor (${response.status}). Recarga la página e intenta de nuevo.`
        );
        return;
      }
    } else if (!response.ok) {
      setServerError(`Error del servidor (${response.status}). Intenta de nuevo.`);
      return;
    }

    if (!response.ok) {
      setServerError(payload.error ?? "Error al procesar la reserva");
      return;
    }

    router.push(`/checkout/confirmation?reservation=${payload.reservationNumber ?? ""}`);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
        <p className="text-sm font-bold text-slate-900">Sobre ti</p>
        <p className="mt-1 text-xs text-slate-600">
          Estos datos figuran en la reserva y ayudan al equipo del evento. El titular debe ser quien compra.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="buyerName">
              Nombre completo (titular)
            </label>
            <Input id="buyerName" autoComplete="name" {...form.register("buyerName")} />
            {form.formState.errors.buyerName ? (
              <p className="text-xs text-red-600">{form.formState.errors.buyerName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="buyerEmail">
              Correo
            </label>
            <Input id="buyerEmail" type="email" autoComplete="email" {...form.register("buyerEmail")} />
            {form.formState.errors.buyerEmail ? (
              <p className="text-xs text-red-600">{form.formState.errors.buyerEmail.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="buyerPhone">
              Teléfono
            </label>
            <Input id="buyerPhone" type="tel" autoComplete="tel" {...form.register("buyerPhone")} />
            {form.formState.errors.buyerPhone ? (
              <p className="text-xs text-red-600">{form.formState.errors.buyerPhone.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="buyerCountry">
              País
            </label>
            <Input
              id="buyerCountry"
              list="checkout-country-suggestions"
              autoComplete="country-name"
              placeholder="Ej. Panamá"
              {...form.register("buyerCountry")}
            />
            <datalist id="checkout-country-suggestions">
              {SUGGESTED_COUNTRIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <p className="text-[11px] text-slate-500">Escribe el país aunque no esté en la lista.</p>
            {form.formState.errors.buyerCountry ? (
              <p className="text-xs text-red-600">{form.formState.errors.buyerCountry.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="buyerAge">
              Edad
            </label>
            <Input
              id="buyerAge"
              type="number"
              min={1}
              max={120}
              inputMode="numeric"
              {...form.register("buyerAge", { valueAsNumber: true })}
            />
            {form.formState.errors.buyerAge ? (
              <p className="text-xs text-red-600">{form.formState.errors.buyerAge.message}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700" htmlFor="quantity">
          Cantidad de entradas (mismo paquete)
        </label>
        <Input
          id="quantity"
          type="number"
          min={1}
          max={10}
          {...form.register("quantity", { valueAsNumber: true })}
        />
        {form.formState.errors.quantity ? (
          <p className="text-xs text-red-600">{form.formState.errors.quantity.message}</p>
        ) : null}
        {guestsNeeded > 0 ? (
          <div className="rounded-xl border border-amber-100 bg-amber-50/90 p-4">
            <p className="text-sm font-semibold text-amber-950">Acompañantes</p>
            <p className="mt-1 text-xs text-amber-900/90">
              Indica el nombre completo de cada persona que recibirá su propia entrada digital (QR único).
            </p>
            <div className="mt-3 space-y-3">
              {Array.from({ length: guestsNeeded }, (_, i) => (
                <div key={i} className="space-y-1">
                  <label className="text-xs font-medium text-slate-700" htmlFor={`guest-${i}`}>
                    Acompañante {i + 1}
                  </label>
                  <Input
                    id={`guest-${i}`}
                    autoComplete="name"
                    {...form.register(`guestNames.${i}` as const)}
                  />
                  {form.formState.errors.guestNames?.[i] ? (
                    <p className="text-xs text-red-600">{form.formState.errors.guestNames[i]?.message}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {form.formState.errors.guestNames &&
        typeof form.formState.errors.guestNames.message === "string" ? (
          <p className="text-xs text-red-600">{form.formState.errors.guestNames.message}</p>
        ) : null}
      </div>

      {serverError ? <p className="text-sm font-medium text-red-600">{serverError}</p> : null}
      <Button className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Procesando..." : "Confirmar reserva"}
      </Button>
    </form>
  );
}
