import { z } from "zod";
import { canAccessAdminPanel } from "@/lib/auth/admin-access";
import { EPR_ORGANIZATION_ID } from "@/features/events/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrganizationRole } from "@/lib/constants/domain";
const orgIdSchema = z.guid("organization_id invalido");

export async function getOrganizationMembership(organizationId: string) {
  const parsed = orgIdSchema.safeParse(organizationId);
  if (!parsed.success) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    userId: user.id,
    organizationId: data.organization_id as string,
    role: data.role as OrganizationRole
  };
}

export function canManageOrganization(role: OrganizationRole): boolean {
  return role === "owner" || role === "admin" || role === "staff";
}

/**
 * Quien puede mutar reservas vía API admin: miembro con rol de gestión en la org,
 * o mismo criterio que el panel (`ADMIN_EMAILS` / metadatos) para la org EPR.
 * Las mutaciones en BD usan service role; la sesión se valida aquí.
 */
export async function requireReservationAdminActor(
  organizationId: string
): Promise<{ userId: string } | null> {
  const parsed = orgIdSchema.safeParse(organizationId);
  if (!parsed.success) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: memberRow, error } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!error && memberRow?.role && canManageOrganization(memberRow.role as OrganizationRole)) {
    return { userId: user.id };
  }

  if (organizationId === EPR_ORGANIZATION_ID && (await canAccessAdminPanel(user))) {
    return { userId: user.id };
  }

  return null;
}
