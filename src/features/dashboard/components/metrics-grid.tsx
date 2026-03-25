import { Card, CardContent } from "@/components/ui/card";
import { dashboardMetrics } from "@/features/dashboard/data";

export function MetricsGrid(): JSX.Element {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {dashboardMetrics.map((metric) => (
        <Card key={metric.label}>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="text-2xl font-black text-slate-900">{metric.value}</p>
            <p className="text-xs font-semibold text-emerald-600">{metric.delta}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
