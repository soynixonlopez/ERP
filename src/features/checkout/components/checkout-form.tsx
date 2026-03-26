"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  checkoutFormSchema,
  type CheckoutFormInput
} from "@/features/checkout/validations";

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
      buyerPhone: ""
    }
  });

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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="buyerName">
          Nombre completo
        </label>
        <Input id="buyerName" {...form.register("buyerName")} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="buyerEmail">
          Correo
        </label>
        <Input id="buyerEmail" type="email" {...form.register("buyerEmail")} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="buyerPhone">
          Telefono
        </label>
        <Input id="buyerPhone" {...form.register("buyerPhone")} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="quantity">
          Cantidad
        </label>
        <Input
          id="quantity"
          type="number"
          min={1}
          max={10}
          {...form.register("quantity", { valueAsNumber: true })}
        />
      </div>
      {serverError ? <p className="text-sm font-medium text-red-600">{serverError}</p> : null}
      <Button className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Procesando..." : "Confirmar reserva"}
      </Button>
    </form>
  );
}
