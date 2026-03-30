import { notFound } from "next/navigation";
import { EventEditorForm } from "@/features/admin/components/event-editor-form";
import { fetchAdminEventById } from "@/features/events/server/queries";

export const dynamic = "force-dynamic";

type AdminEventEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEventEditPage({ params }: AdminEventEditPageProps): Promise<JSX.Element> {
  const { id } = await params;
  const row = await fetchAdminEventById(id);
  if (!row) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Editar evento</h1>
        <p className="text-sm text-slate-600">{row.title}</p>
      </div>
      <EventEditorForm initial={row} />
    </section>
  );
}
