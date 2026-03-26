"use client";

import { useActionState } from "react";
import {
  resendSignupConfirmationAction,
  signInAction,
  type AuthActionState
} from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { Lock, UserRound } from "lucide-react";

const initialSignInState: AuthActionState = {};
const initialResendState = { error: undefined as string | undefined, ok: false as boolean };

type SignInFormProps = {
  variant?: "default" | "standalone";
};

export function SignInForm({ variant = "default" }: SignInFormProps): JSX.Element {
  const [state, action, pending] = useActionState(signInAction, initialSignInState);
  const [resendState, resendAction, resendPending] = useActionState(
    resendSignupConfirmationAction,
    initialResendState
  );
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
        {state.hint === "resend" ? (
          <div className="space-y-2">
            <Button
              type="submit"
              formAction={resendAction}
              disabled={resendPending}
              variant="secondary"
              size="lg"
              className="h-12 w-full rounded-xl border-2 border-[var(--epr-blue-800)] text-base font-semibold text-[var(--epr-blue-800)]"
            >
              {resendPending ? "Enviando..." : "Reenviar correo de confirmación"}
            </Button>
            {resendState.ok ? (
              <p className="text-center text-sm font-medium text-emerald-700">
                Listo. Revisa tu bandeja (y spam) y abre el enlace del correo; luego podrás iniciar sesión.
              </p>
            ) : null}
            {resendState.error ? (
              <p className="text-center text-sm font-medium text-red-600">{resendState.error}</p>
            ) : null}
          </div>
        ) : null}
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
      {state.hint === "resend" ? (
        <div className="space-y-2">
          <Button
            type="submit"
            formAction={resendAction}
            disabled={resendPending}
            variant="secondary"
            className="w-full"
          >
            {resendPending ? "Enviando..." : "Reenviar correo de confirmación"}
          </Button>
          {resendState.ok ? (
            <p className="text-sm font-medium text-emerald-700">
              Listo. Revisa tu bandeja (y spam) y abre el enlace del correo; luego podrás iniciar sesión.
            </p>
          ) : null}
          {resendState.error ? <p className="text-sm font-medium text-red-600">{resendState.error}</p> : null}
        </div>
      ) : null}
      <Button className="w-full" disabled={pending}>
        {pending ? "Ingresando..." : "Iniciar sesion"}
      </Button>
    </form>
  );
}
