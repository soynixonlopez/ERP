import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage(): JSX.Element {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="relative inline-block">
        <h1 className="text-4xl font-black tracking-tight text-[var(--epr-blue-800)]">Políticas de Privacidad</h1>
        <div className="mt-1 h-1 w-32 bg-[var(--accent)]" />
      </div>

      <Card className="rounded-2xl">
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            En EPR S.A. usamos tus datos únicamente para gestionar tu registro, reservas y comunicación relacionada a los eventos.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Datos que recolectamos: nombre, correo, teléfono y datos de registro necesarios.</li>
            <li>Finalidad: confirmar reservas, coordinar acceso y responder solicitudes.</li>
            <li>No vendemos tus datos a terceros.</li>
            <li>Puedes solicitar actualización o eliminación escribiendo al correo de contacto.</li>
          </ul>
          <p className="text-xs text-slate-500">
            Esta página es un texto base. Si tienes un documento legal oficial, lo integramos aquí.
          </p>
        </CardContent>
      </Card>

      <Link href="/contact" className="text-sm font-semibold text-[var(--primary)] hover:underline">
        ¿Tienes dudas? Contáctanos
      </Link>
    </section>
  );
}

