"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminTicketSchema } from "@/lib/validations/admin-tickets";

type CreateTicketFormValues = z.input<typeof adminTicketSchema>;

type CreateTicketFormProps = {
  organizationId: string;
  eventId: string;
};

export function CreateTicketForm({ organizationId, eventId }: CreateTicketFormProps): React.JSX.Element {
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<CreateTicketFormValues>({
    resolver: zodResolver(adminTicketSchema),
    defaultValues: {
      organizationId,
      eventId,
      name: "",
      description: "",
      badgeLabel: "GENERAL",
      price: 0,
      inventory: 0,
      minPerOrder: 1,
      maxPerOrder: 10,
      sortOrder: 0,
      visibility: "public",
      isActive: true
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setMessage(null);
    const response = await fetch("/api/admin/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const payload = (await response.json()) as { id?: string; error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "No se pudo crear el paquete");
      return;
    }

    setMessage("Paquete creado correctamente.");
    form.reset({ ...form.getValues(), name: "", description: "", price: 0, inventory: 0 });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-(--border) bg-white p-4">
      <h2 className="text-base font-bold text-slate-900">Crear paquete</h2>
      <Input placeholder="Nombre del paquete" {...form.register("name")} />
      <Input placeholder="Descripcion" {...form.register("description")} />
      <Input placeholder="Etiqueta (VIP/GENERAL)" {...form.register("badgeLabel")} />
      <Input type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} />
      <Input type="number" {...form.register("inventory", { valueAsNumber: true })} />
      <Input type="hidden" {...form.register("organizationId")} />
      <Input type="hidden" {...form.register("eventId")} />
      <Input type="hidden" {...form.register("minPerOrder", { valueAsNumber: true })} />
      <Input type="hidden" {...form.register("maxPerOrder", { valueAsNumber: true })} />
      <Input type="hidden" {...form.register("sortOrder", { valueAsNumber: true })} />
      <Input type="hidden" {...form.register("visibility")} />
      <Input type="hidden" {...form.register("isActive")} />
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creando..." : "Crear paquete"}
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
