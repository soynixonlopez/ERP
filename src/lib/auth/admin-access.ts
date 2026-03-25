import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EPR_ORGANIZATION_ID } from "@/features/events/data";
import type { OrganizationRole } from "@/lib/constants/domain";

export { EPR_ORGANIZATION_ID };

const ADMIN_ROLES: OrganizationRole[] = ["owner", "admin", "staff"];

function adminEmailsFromEnv(): string[] {
  const raw =
    process.env.ADMIN_EMAILS ??
    process.env.ADMIN_EMAIL ??
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ??
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ??
    "";
  return raw
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, "").toLowerCase())
    .filter(Boolean);
}

function isAdminFromUserMetadata(user: User): boolean {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  if (meta?.is_admin === true || meta?.app_role === "admin" || meta?.role === "admin") {
    return true;
  }
  const app = user.app_metadata as Record<string, unknown> | undefined;
  if (app?.role === "admin" || app?.is_admin === true) {
    return true;
  }
  return false;
}

/** Acceso al panel /admin: ADMIN_EMAILS, metadatos admin, o miembro con rol en organization_members. */
export async function canAccessAdminPanel(user: User): Promise<boolean> {
  if (isAdminFromUserMetadata(user)) {
    return true;
  }

  const email = user.email?.toLowerCase();
  if (email && adminEmailsFromEnv().includes(email)) {
    return true;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", EPR_ORGANIZATION_ID)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data?.role) {
    return false;
  }

  return ADMIN_ROLES.includes(data.role as OrganizationRole);
}

/** Tras login/registro: admin → panel; resto → mis reservas. */
export async function getPostLoginRedirectPath(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return "/login";
  }

  if (await canAccessAdminPanel(user)) {
    return "/admin";
  }

  return "/my-reservations";
}
