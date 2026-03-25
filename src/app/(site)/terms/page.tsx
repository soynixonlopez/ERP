import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage(): JSX.Element {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="relative inline-block">
        <h1 className="text-4xl font-black tracking-tight text-[var(--epr-blue-800)]">Aviso Legal</h1>
        <div className="mt-1 h-1 w-24 bg-[var(--accent)]" />
      </div>

      <Card className="rounded-2xl">
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Este sitio permite gestionar reservas y paquetes para eventos organizados por EPR S.A.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Las reservas están sujetas a disponibilidad.</li>
            <li>La información del evento, horarios y ubicación puede cambiar por causas operativas.</li>
            <li>El uso de la plataforma implica aceptación de estas condiciones.</li>
          </ul>
          <p className="text-xs text-slate-500">
            Texto base. Si cuentas con un aviso legal oficial, lo reemplazamos por el documento completo.
          </p>
        </CardContent>
      </Card>

      <Link href="/contact" className="text-sm font-semibold text-[var(--primary)] hover:underline">
        Contacto del organizador
      </Link>
    </section>
  );
}

