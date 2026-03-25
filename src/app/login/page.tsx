import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export default function LoginPage(): JSX.Element {
  return (
    <section className="mx-auto max-w-md">
      <Card>
        <CardContent className="space-y-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900">Iniciar sesion</h1>
            <p className="text-sm text-slate-600">Accede a tus reservas y perfil.</p>
          </div>
          <SignInForm />
          <p className="text-sm text-slate-600">
            No tienes cuenta?{" "}
            <Link href="/register" className="font-semibold text-[var(--primary)]">
              Registrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
