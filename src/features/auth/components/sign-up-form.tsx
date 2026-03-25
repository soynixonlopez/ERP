"use client";

import { useActionState } from "react";
import { signUpAction } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = {
  error: undefined as string | undefined
};

export function SignUpForm(): JSX.Element {
  const [state, action, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
          Nombre completo
        </label>
        <Input id="fullName" name="fullName" type="text" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Correo
        </label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Contrasena
        </label>
        <Input id="password" name="password" type="password" required />
      </div>
      {state.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}
      <Button className="w-full" disabled={pending}>
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
