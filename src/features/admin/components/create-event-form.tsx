"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminEventSchema, type AdminEventInput } from "@/lib/validations/admin-events";

type CreateEventFormProps = {
  organizationId: string;
};

export function CreateEventForm({ organizationId }: CreateEventFormProps): React.JSX.Element {
  const toLocalDatetime = (date: Date): string => {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
  };

  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<AdminEventInput>({
    resolver: zodResolver(adminEventSchema),
    defaultValues: {
      organizationId,
      title: "",
      slug: "",
      description: "",
      shortDescription: "",
      location: "",
      startsAt: toLocalDatetime(new Date()),
      endsAt: toLocalDatetime(new Date(Date.now() + 2 * 60 * 60 * 1000)),
      status: "draft"
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setMessage(null);
    const response = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        startsAt: new Date(values.startsAt).toISOString(),
        endsAt: new Date(values.endsAt).toISOString()
      })
    });

    const payload = (await response.json()) as { id?: string; error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "No se pudo crear el evento");
      return;
    }

    setMessage("Evento creado correctamente.");
    form.reset({ ...form.getValues(), title: "", slug: "", description: "", shortDescription: "", location: "" });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-[var(--border)] bg-white p-4">
      <h2 className="text-base font-bold text-slate-900">Crear evento</h2>
      <Input placeholder="Titulo" {...form.register("title")} />
      <Input placeholder="slug-del-evento" {...form.register("slug")} />
      <Input placeholder="Ubicacion" {...form.register("location")} />
      <Input placeholder="Descripcion corta" {...form.register("shortDescription")} />
      <Input placeholder="Descripcion completa" {...form.register("description")} />
      <Input type="datetime-local" {...form.register("startsAt")} />
      <Input type="datetime-local" {...form.register("endsAt")} />
      <input type="hidden" {...form.register("organizationId")} />
      <input type="hidden" {...form.register("status")} />
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creando..." : "Crear evento"}
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
