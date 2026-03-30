import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canAccessAdminPanel } from "@/lib/auth/admin-access";
import { syncEprOrgMembershipForAdminUser } from "@/lib/auth/sync-epr-org-membership";
import { AdminShell } from "@/features/admin/components/admin-shell";

type AdminRootLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminRootLayout({ children }: AdminRootLayoutProps): Promise<JSX.Element> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (!(await canAccessAdminPanel(user))) {
    redirect("/my-reservations");
  }

  await syncEprOrgMembershipForAdminUser(user);

  return <AdminShell>{children}</AdminShell>;
}
