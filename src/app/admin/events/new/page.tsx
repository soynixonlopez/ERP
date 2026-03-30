import { EventEditorForm } from "@/features/admin/components/event-editor-form";

export const dynamic = "force-dynamic";

export default function AdminNewEventPage(): JSX.Element {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Nuevo evento</h1>
        <p className="text-sm text-slate-600">
          Estados &quot;Publicado&quot; o &quot;Próximamente&quot; son visibles en el sitio público.
        </p>
      </div>
      <EventEditorForm initial={null} />
    </section>
  );
}
