import type { ColumnDef } from "@tanstack/react-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/tables/data-table";
import { CreateEventForm } from "@/features/admin/components/create-event-form";
import { EPR_ORGANIZATION_ID } from "@/features/events/data";

export const dynamic = "force-dynamic";

type AdminEventRow = {
  id: string;
  title: string;
  slug: string;
  location: string;
  startAt: string;
  status: string;
};

const columns: ColumnDef<AdminEventRow>[] = [
  { accessorKey: "title", header: "Título" },
  { accessorKey: "slug", header: "Slug" },
  { accessorKey: "location", header: "Ubicación" },
  { accessorKey: "startAt", header: "Inicio" },
  { accessorKey: "status", header: "Estado" }
];

export default async function AdminEventsPage(): Promise<JSX.Element> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, slug, location, starts_at, status")
    .eq("organization_id", EPR_ORGANIZATION_ID)
    .order("starts_at", { ascending: true });

  const rows: AdminEventRow[] =
    data?.map((e) => ({
      id: e.id as string,
      title: e.title as string,
      slug: e.slug as string,
      location: e.location as string,
      startAt: new Date(e.starts_at as string).toLocaleString("es-PA", {
        dateStyle: "short",
        timeStyle: "short"
      }),
      status: e.status as string
    })) ?? [];

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Gestión de eventos</h1>
        <p className="text-sm text-slate-600">Eventos publicados en Supabase para esta organización.</p>
      </div>
      <CreateEventForm organizationId={EPR_ORGANIZATION_ID} />
      <DataTable data={rows} columns={columns} />
    </section>
  );
}
