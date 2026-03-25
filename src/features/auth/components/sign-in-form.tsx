"use client";

import { useActionState } from "react";
import { signInAction } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { Lock, UserRound } from "lucide-react";

const initialState = {
  error: undefined as string | undefined
};

type SignInFormProps = {
  variant?: "default" | "standalone";
};

export function SignInForm({ variant = "default" }: SignInFormProps): JSX.Element {
  const [state, action, pending] = useActionState(signInAction, initialState);

  if (variant === "standalone") {
    return (
      <form action={action} className="space-y-4">
        <div className="relative">
          <UserRound
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--epr-blue-800)]"
            aria-hidden
          />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Correo"
            className={cn(
              "h-12 rounded-full border-2 border-[var(--epr-blue-800)] bg-white pl-11 text-sm text-slate-800",
              "placeholder:text-[var(--epr-blue-800)]/80 placeholder:font-medium"
            )}
          />
        </div>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--epr-blue-800)]"
            aria-hidden
          />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Contraseña"
            className={cn(
              "h-12 rounded-full border-2 border-[var(--epr-blue-800)] bg-white pl-11 text-sm text-slate-800",
              "placeholder:text-[var(--epr-blue-800)]/80 placeholder:font-medium"
            )}
          />
        </div>
        {state.error ? <p className="text-center text-sm font-medium text-red-600">{state.error}</p> : null}
        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-xl bg-[var(--epr-blue-800)] text-base font-bold text-white hover:bg-[var(--epr-blue-800)]/90"
        >
          {pending ? "Ingresando..." : "Ingresar"}
        </Button>
        <div className="relative pt-1">
          <div className="mx-auto h-px max-w-[92%] rounded-full bg-slate-200" />
        </div>
      </form>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-slate-700">
          * Usuario
        </label>
        <div className="relative">
          <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--epr-blue-800)]" />
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
            autoComplete="current-password"
            placeholder="Contraseña"
          />
        </div>
      </div>
      {state.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}
      <Button className="w-full" disabled={pending}>
        {pending ? "Ingresando..." : "Iniciar sesion"}
      </Button>
    </form>
  );
}
