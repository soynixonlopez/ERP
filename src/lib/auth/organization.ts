import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrganizationRole } from "@/lib/constants/domain";

const orgIdSchema = z.uuid("organization_id invalido");

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
