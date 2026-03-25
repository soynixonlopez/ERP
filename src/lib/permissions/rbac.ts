import type { OrganizationRole } from "@/lib/constants/domain";

const permissions: Record<OrganizationRole, string[]> = {
  owner: ["events:manage", "tickets:manage", "reservations:manage", "payments:manage", "team:manage"],
  admin: ["events:manage", "tickets:manage", "reservations:manage", "payments:manage"],
  staff: ["reservations:manage", "checkin:manage"],
  viewer: ["dashboard:read"]
};

export function hasPermission(role: OrganizationRole, permission: string): boolean {
  return permissions[role]?.includes(permission) ?? false;
}
