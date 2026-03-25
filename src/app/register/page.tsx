import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = {
  title: "Registrarme | EPR Reservas",
  description: "Crea tu cuenta para reservar entradas y acceder al evento."
};

export default function RegisterPage(): JSX.Element {
  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <div className="absolute left-3 top-3 z-10 sm:left-5 sm:top-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-[var(--epr-blue-800)] hover:bg-slate-50 hover:underline"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Inicio
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center px-4 pb-12 pt-20 sm:px-6">
        <div className="w-full max-w-[400px] space-y-8">
          <header className="text-center">
            <h1 className="text-3xl font-black tracking-tight text-[var(--epr-blue-800)] sm:text-4xl">
              REGISTRARME
            </h1>
            <div className="mx-auto mt-2 h-1 w-32 bg-[var(--accent)]" />
            <p className="mt-6 text-sm leading-relaxed text-[var(--epr-blue-800)]">
              Para continuar con la compra de tus entradas, debes crear tu usuario si aún no lo has
              hecho, ingresando tus datos para poder completar el proceso y acceder al evento sin
              inconvenientes.
            </p>
          </header>

          <SignUpForm variant="standalone" />

          <p className="text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-bold text-[var(--epr-blue-800)] hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
