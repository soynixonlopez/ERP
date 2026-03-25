import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export default function RegisterPage(): JSX.Element {
  return (
    <section className="mx-auto max-w-md">
      <Card>
        <CardContent className="space-y-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900">Crear cuenta</h1>
            <p className="text-sm text-slate-600">Registra tus datos para reservar entradas y paquetes.</p>
          </div>
          <SignUpForm />
          <p className="text-sm text-slate-600">
            Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold text-[var(--primary)]">
              Inicia sesion
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
