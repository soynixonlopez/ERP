import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | EPR Reservas",
  description: "Accede a tu cuenta para gestionar reservas y perfil."
};

export default function LoginPage(): JSX.Element {
  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <Link
        href="/"
        className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-[var(--epr-blue-800)] hover:bg-slate-50 hover:underline sm:left-5 sm:top-5"
      >
        <ArrowLeft className="size-4 shrink-0" aria-hidden />
        Inicio
      </Link>

      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-10 pt-16 sm:px-6">
        <div className="w-full max-w-[340px] space-y-7">
          <div className="flex justify-center">
            <div className="relative h-28 w-28 sm:h-32 sm:w-32">
              <Image
                src="/assets/imagenes/LogoCuadradoColor.png"
                alt="EPR S.A."
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 112px, 128px"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-t-2xl border border-slate-200/90 bg-white shadow-sm">
            <div className="bg-[var(--epr-blue-800)] py-3.5 text-center">
              <h1 className="!text-center text-base font-bold text-white">Iniciar sesión</h1>
            </div>
            <div className="bg-white px-5 pb-5 pt-6">
              <SignInForm variant="standalone" />
            </div>
          </div>

          <p className="text-center text-sm text-slate-600">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/register" className="font-bold text-[var(--epr-blue-800)] hover:underline">
              Crear una
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
