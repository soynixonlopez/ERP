export function SiteFooter(): JSX.Element {
  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-3 px-4 py-8 text-sm text-slate-600 md:px-6">
        <p className="font-semibold text-slate-900">EPR S.A. - Reservas de eventos</p>
        <p>Instagram: @epr.oficial | WhatsApp: +507 6000-0000 | soporte@epr.com</p>
        <p>Plataforma multi-tenant preparada para evolucionar a SaaS.</p>
      </div>
    </footer>
  );
}
