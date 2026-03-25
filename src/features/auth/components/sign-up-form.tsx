"use client";

import { useActionState } from "react";
import { signUpAction } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { toProperCase } from "@/lib/utils/proper-case";
import { IdCard, Lock, Mail, Phone, UserRound } from "lucide-react";

const initialState = {
  error: undefined as string | undefined
};

type SignUpFormProps = {
  variant?: "default" | "standalone";
};

const inputStandalone = cn(
  "h-12 flex-1 rounded-full border-2 border-[var(--epr-blue-800)] bg-white text-sm text-slate-800",
  "placeholder:text-[var(--epr-blue-800)]/80 placeholder:font-medium"
);

export function SignUpForm({ variant = "default" }: SignUpFormProps): JSX.Element {
  const [state, action, pending] = useActionState(signUpAction, initialState);

  if (variant === "standalone") {
    return (
      <form action={action} className="space-y-4">
        <div className="flex items-center gap-3">
          <UserRound className="size-6 shrink-0 text-[var(--epr-blue-800)]" aria-hidden />
          <Input
            id="fullName"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            placeholder="Nombre y apellido"
            onBlur={(e) => {
              e.currentTarget.value = toProperCase(e.currentTarget.value);
            }}
            className={cn(inputStandalone, "min-w-0")}
          />
        </div>

        <div className="flex items-center gap-3">
          <IdCard className="size-6 shrink-0 text-[var(--epr-blue-800)]" aria-hidden />
          <Input
            id="cedula"
            name="cedula"
            type="text"
            inputMode="numeric"
            required
            placeholder="Cédula sin guiones"
            className={cn(inputStandalone, "min-w-0")}
          />
        </div>

        <div className="flex items-center gap-3">
          <Phone className="size-6 shrink-0 text-[var(--epr-blue-800)]" aria-hidden />
          <Input
            id="numero"
            name="numero"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="Número de celular"
            className={cn(inputStandalone, "min-w-0")}
          />
        </div>

        <div className="flex items-center gap-3">
          <Mail className="size-6 shrink-0 text-[var(--epr-blue-800)]" aria-hidden />
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Correo"
            className={cn(inputStandalone, "min-w-0")}
          />
        </div>

        <div className="flex items-center gap-3">
          <Lock className="size-6 shrink-0 text-[var(--epr-blue-800)]" aria-hidden />
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Contraseña"
            className={cn(inputStandalone, "min-w-0")}
          />
        </div>

        <label className="flex items-start gap-3 pt-1 text-sm leading-snug text-[var(--epr-blue-800)]">
          <input
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 rounded border-2 border-[var(--epr-blue-800)] accent-[var(--epr-blue-800)]"
          />
          <span>
            Autorizo el uso de mis datos personales para el registro, compra de entradas y acceso al
            evento.
          </span>
        </label>

        {state.error ? (
          <p className="text-center text-sm font-medium text-red-600">{state.error}</p>
        ) : null}

        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-xl bg-[var(--epr-blue-800)] text-base font-bold text-white hover:bg-[var(--epr-blue-800)]/90"
        >
          {pending ? "Creando cuenta..." : "Registrarme"}
        </Button>
      </form>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
          * Nombre
        </label>
        <div className="relative">
          <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--epr-blue-800)]" />
          <Input
            id="fullName"
            name="fullName"
            type="text"
            required
            className="pl-10"
            autoComplete="name"
            placeholder="Nombre y apellido"
            onBlur={(e) => {
              e.currentTarget.value = toProperCase(e.currentTarget.value);
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="cedula" className="text-sm font-semibold text-slate-700">
          * Cédula
        </label>
        <div className="relative">
          <IdCard className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--epr-blue-800)]" />
          <Input
            id="cedula"
            name="cedula"
            type="text"
            inputMode="numeric"
            required
            className="pl-10"
            placeholder="Cédula sin guiones"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="numero" className="text-sm font-semibold text-slate-700">
          * Número
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--epr-blue-800)]" />
          <Input
            id="numero"
            name="numero"
            type="tel"
            required
            inputMode="tel"
            className="pl-10"
            autoComplete="tel"
            placeholder="Número de celular"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-slate-700">
          * Correo
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--epr-blue-800)]" />
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="pl-10"
            autoComplete="email"
            placeholder="Correo"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-slate-700">
          * Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--epr-blue-800)]" />
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="pl-10"
            autoComplete="new-password"
            placeholder="Contraseña"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 pt-2 text-sm text-slate-700">
        <input
          id="acceptTerms"
          name="acceptTerms"
          type="checkbox"
          className="mt-1 size-4 accent-[var(--epr-blue-800)]"
        />
        <span>
          Autorizo el uso de mis datos personales para el registro, compra de entradas y acceso al
          evento.
        </span>
      </label>

      {state.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

      <Button className="w-full" disabled={pending}>
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
