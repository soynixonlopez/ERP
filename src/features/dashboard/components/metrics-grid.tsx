import { Card, CardContent } from "@/components/ui/card";
import type { DashboardMetric } from "@/features/dashboard/server/queries";

type MetricsGridProps = {
  metrics: DashboardMetric[];
};

export function MetricsGrid({ metrics }: MetricsGridProps): JSX.Element {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="text-2xl font-black text-slate-900">{metric.value}</p>
            {metric.hint ? <p className="text-xs text-slate-400">{metric.hint}</p> : null}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
