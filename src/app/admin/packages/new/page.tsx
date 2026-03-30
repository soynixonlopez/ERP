import Link from "next/link";
import { PackageEditorForm } from "@/features/admin/components/package-editor-form";
import { fetchAdminEvents } from "@/features/events/server/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

export default async function AdminNewPackagePage(): Promise<JSX.Element> {
  const events = await fetchAdminEvents();
  const eventOptions = events.map((e) => ({ id: e.id, title: e.title }));

  if (eventOptions.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-black text-slate-900">Nuevo paquete</h1>
        <p className="text-sm text-slate-600">Necesitas un evento antes de crear paquetes.</p>
        <Link href="/admin/events/new" className={cn(buttonVariants({ variant: "accent", size: "md" }))}>
          Crear evento
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Nuevo paquete</h1>
        <p className="text-sm text-slate-600">Visible en la web si el evento está publicado y el paquete es público y activo.</p>
      </div>
      <PackageEditorForm initial={null} events={eventOptions} />
    </section>
  );
}
