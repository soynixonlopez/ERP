import { CheckInWorkspace } from "@/features/check-in/components/check-in-workspace";
import { EPR_ORGANIZATION_ID } from "@/features/events/data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminCheckInPage(): Promise<JSX.Element> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, starts_at, status")
    .eq("organization_id", EPR_ORGANIZATION_ID)
    .order("starts_at", { ascending: true });

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900">Control de acceso</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Escanea el QR del ticket (misma invitacion que ve el cliente). Varios telefonos o pistolas USB pueden operar a la
          vez: la base evita doble ingreso por persona y el contador se actualiza para todos.
        </p>
      </div>
      <CheckInWorkspace organizationId={EPR_ORGANIZATION_ID} events={data ?? []} />
    </section>
  );
}
