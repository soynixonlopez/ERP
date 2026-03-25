import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOutAction } from "@/features/auth/actions/auth-actions";

export default async function ProfilePage(): Promise<JSX.Element> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-black text-slate-900">Mi perfil</h1>
      <Card>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Nombre</p>
            <p className="text-base font-medium text-slate-900">
              {(user.user_metadata.full_name as string | undefined) ?? "Sin nombre"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Correo</p>
            <p className="text-base font-medium text-slate-900">{user.email}</p>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="secondary">
              Cerrar sesion
            </Button>
          </form>
          <Link href="/my-reservations">
            <Button type="button">Ver mis reservas</Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
