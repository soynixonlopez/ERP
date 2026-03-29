import { MetricsGrid } from "@/features/dashboard/components/metrics-grid";
import { RecentReservationsTable } from "@/features/dashboard/components/recent-reservations-table";
import { EPR_ORGANIZATION_ID } from "@/features/events/data";
import { getDashboardMetrics, getRecentReservationsAdmin } from "@/features/dashboard/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage(): Promise<JSX.Element> {
  const [metrics, recent] = await Promise.all([
    getDashboardMetrics(EPR_ORGANIZATION_ID),
    getRecentReservationsAdmin(EPR_ORGANIZATION_ID, 10)
  ]);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
        <p className="text-slate-600">
          Datos en vivo de Supabase para la organización EPR (reservas y pagos).
        </p>
      </div>
      <MetricsGrid metrics={metrics} />
      <RecentReservationsTable rows={recent} />
    </section>
  );
}
