import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { InviteTicketArticle } from "@/features/invites/components/invite-ticket-article";
import { canAccessAdminPanel } from "@/lib/auth/admin-access";
import { getAppBaseUrl } from "@/lib/config/manual-payments";
import { getInviteTicketData } from "@/lib/invites/get-invite-ticket-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type InvitePageProps = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

function slugForFile(reservationNumber: string): string {
  return reservationNumber.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "reserva";
}

export default async function InvitePage({ params }: InvitePageProps): Promise<JSX.Element> {
  const { token } = await params;
  const data = await getInviteTicketData(token);

  if (!data) {
    notFound();
  }

  const baseUrl = getAppBaseUrl();
  const invitationUrl = `${baseUrl}/invite/${data.qrToken}`;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const isAdminUser = user ? await canAccessAdminPanel(user) : false;

  const backLinkClass =
    "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50";

  return (
    <section className="mx-auto w-full min-w-0 max-w-6xl px-1 sm:px-0 print:max-w-none">
      <nav
        className="mb-4 flex flex-wrap items-center gap-2 print:hidden"
        aria-label="Volver"
      >
        {isAdminUser ? (
          <Link href="/admin/reservations" className={backLinkClass}>
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Volver a gestion de reservas
          </Link>
        ) : user ? (
          <Link href="/my-reservations" className={backLinkClass}>
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Volver a mis reservas
          </Link>
        ) : (
          <Link href="/" className={backLinkClass}>
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Ir al inicio
          </Link>
        )}
      </nav>

      <InviteTicketArticle
        data={data}
        invitationUrl={invitationUrl}
        fileSlug={slugForFile(data.reservationNumber)}
      />
    </section>
  );
}
