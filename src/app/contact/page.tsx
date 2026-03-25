import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage(): JSX.Element {
  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-black text-slate-900">Contacto</h1>
      <Card>
        <CardContent className="space-y-2">
          <p className="text-slate-700">Equipo EPR S.A.</p>
          <p className="text-sm text-slate-600">Correo: soporte@epr.com</p>
          <p className="text-sm text-slate-600">WhatsApp: +507 6000-0000</p>
          <p className="text-sm text-slate-600">Horario: Lunes a Sabado, 8:00 am - 8:00 pm</p>
        </CardContent>
      </Card>
    </section>
  );
}
