import { MetricsGrid } from "@/features/dashboard/components/metrics-grid";
import { RecentReservationsTable } from "@/features/dashboard/components/recent-reservations-table";

export default function AdminDashboardPage(): JSX.Element {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Vista ejecutiva de reservas, pagos e ingresos por organizacion.</p>
      </div>
      <MetricsGrid />
      <RecentReservationsTable />
    </section>
  );
}
