import { useAuthStore } from '@/core/auth/stores/useAuthStore';
import { permissions } from '@/shared/types/roles';
import type { Action, Resource } from '@/shared/types/roles';
export function usePermission(resource: Resource, action: Action): boolean {
  const role = useAuthStore((s) => s.user?.role);
  if (!role) return false;
  return permissions[role]?.[resource]?.includes(action) ?? false;
}
