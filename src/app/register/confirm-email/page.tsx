import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Confirma tu correo | EPR Reservas",
  description: "Revisa tu bandeja de entrada para activar tu cuenta."
};

type PageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function ConfirmEmailPage({ searchParams }: PageProps): Promise<JSX.Element> {
  const { email } = await searchParams;
  const safeEmail = email ? decodeURIComponent(email) : null;

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

      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-12 pt-20 sm:px-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--epr-blue-800)]/10">
            <Mail className="size-8 text-[var(--epr-blue-800)]" aria-hidden />
          </div>
          <div className="space-y-2">
            <h1 className="!text-center text-2xl font-black tracking-tight text-[var(--epr-blue-800)] sm:text-3xl">
              Confirma tu correo
            </h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Te enviamos un enlace a{" "}
              {safeEmail ? (
                <span className="font-semibold text-slate-800">{safeEmail}</span>
              ) : (
                "tu correo"
              )}
              . Ábrelo y pulsa <strong>Confirmar</strong> para activar tu cuenta. Revisa también la
              carpeta de spam.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm text-emerald-950">
            <p className="font-semibold">Después de confirmar</p>
            <p className="mt-1 text-emerald-900/90">
              Al abrir el enlace del correo entrarás al sitio con tu cuenta activa. Si no te reconoce
              la sesión, ve a{" "}
              <Link href="/login" className="font-bold underline">
                iniciar sesión
              </Link>{" "}
              con el mismo correo y contraseña.
            </p>
          </div>
          <p className="text-sm text-slate-500">
            ¿No recibiste el correo? Espera unos minutos o revisa que escribiste bien el email al
            registrarte.
          </p>
          <Link
            href="/login"
            className="inline-flex text-sm font-bold text-[var(--epr-blue-800)] hover:underline"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
