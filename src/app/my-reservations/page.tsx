import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function MyReservationsPage(): Promise<JSX.Element> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("reservations")
    .select("id, reservation_number, status, payment_status, total, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black text-slate-900">Mis reservas</h1>
      {data?.length ? (
        <div className="grid gap-4">
          {data.map((reservation) => (
            <Card key={reservation.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{reservation.reservation_number}</p>
                  <p className="text-xs text-slate-500">
                    Estado reserva: {reservation.status} | Estado pago: {reservation.payment_status}
                  </p>
                  <p className="text-xs text-slate-500">Total: ${Number(reservation.total).toFixed(2)}</p>
                </div>
                <Link href={`/checkout/confirmation?reservation=${reservation.reservation_number}`}>
                  <Button variant="secondary">Ver detalle</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-600">Todavia no tienes reservas registradas.</p>
      )}
    </section>
  );
}
