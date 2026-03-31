import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { EPR_ORGANIZATION_ID, hasAdminBypassCredentials } from "@/lib/auth/admin-access";
import { logServerError, logServerWarn } from "@/lib/logging/server-log";

/**
 * Si el usuario entra al panel por correo/metadatos pero RLS aún no lo ve en `organization_members`,
 * inserta o eleva el rol con la service role (requiere SUPABASE_SERVICE_ROLE_KEY en el servidor).
 * Así no hace falta ejecutar SQL manual en Supabase.
 */
export async function syncEprOrgMembershipForAdminUser(user: User): Promise<void> {
  if (!hasAdminBypassCredentials(user)) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data: existing, error: readError } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", EPR_ORGANIZATION_ID)
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError) {
    logServerWarn("syncEprOrgMembership.read", readError.message);
    return;
  }

  if (existing?.role === "owner" || existing?.role === "admin" || existing?.role === "staff") {
    return;
  }

  try {
    const admin = createSupabaseAdminClient();
    if (!existing) {
      const { error } = await admin.from("organization_members").insert({
        organization_id: EPR_ORGANIZATION_ID,
        user_id: user.id,
        role: "admin"
      });
      if (error?.code === "23505") {
        return;
      }
      if (error) {
        logServerWarn("syncEprOrgMembership.insert", error.message);
      }
      return;
    }

    if (existing.role === "viewer") {
      const { error } = await admin
        .from("organization_members")
        .update({ role: "admin" })
        .eq("organization_id", EPR_ORGANIZATION_ID)
        .eq("user_id", user.id);
      if (error) {
        logServerWarn("syncEprOrgMembership.promote", error.message);
      }
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      logServerWarn("syncEprOrgMembership", "service_role_missing");
      return;
    }
    logServerError("syncEprOrgMembership", e);
  }
}
