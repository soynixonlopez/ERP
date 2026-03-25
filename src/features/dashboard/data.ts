export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
};

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Reservas totales", value: "2,438", delta: "+14.2%" },
  { label: "Reservas confirmadas", value: "1,996", delta: "+10.8%" },
  { label: "Pendientes de pago", value: "311", delta: "-3.1%" },
  { label: "Ingresos", value: "$184,720", delta: "+18.7%" },
  { label: "Eventos activos", value: "7", delta: "+2" },
  { label: "Clientes registrados", value: "5,902", delta: "+9.4%" }
];

export const recentReservations = [
  {
    reservationNumber: "RSV-2026-10392",
    customer: "Maria Gonzalez",
    event: "Summer Beats 2026",
    total: "$220.00",
    reservationStatus: "confirmed",
    paymentStatus: "paid"
  },
  {
    reservationNumber: "RSV-2026-10391",
    customer: "Luis Mena",
    event: "EPR Business Summit",
    total: "$240.00",
    reservationStatus: "pending_payment",
    paymentStatus: "pending"
  }
];
