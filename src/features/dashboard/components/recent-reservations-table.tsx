import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { recentReservations } from "@/features/dashboard/data";

export function RecentReservationsTable(): JSX.Element {
  return (
    <Card>
      <CardContent>
        <h2 className="mb-4 text-base font-bold text-slate-900">Ultimas reservas</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-slate-500">
                <th className="pb-2">Reserva</th>
                <th className="pb-2">Cliente</th>
                <th className="pb-2">Evento</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Estado reserva</th>
                <th className="pb-2">Estado pago</th>
              </tr>
            </thead>
            <tbody>
              {recentReservations.map((item) => (
                <tr key={item.reservationNumber} className="border-b border-[var(--border)]">
                  <td className="py-3 font-medium text-slate-900">{item.reservationNumber}</td>
                  <td>{item.customer}</td>
                  <td>{item.event}</td>
                  <td>{item.total}</td>
                  <td>
                    <Badge tone={item.reservationStatus === "confirmed" ? "success" : "warning"}>
                      {item.reservationStatus}
                    </Badge>
                  </td>
                  <td>
                    <Badge tone={item.paymentStatus === "paid" ? "success" : "warning"}>
                      {item.paymentStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
