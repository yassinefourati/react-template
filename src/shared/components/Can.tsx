import { usePermission } from '@/shared/hooks/usePermission';
import type { Action, Resource } from '@/shared/types/roles';
import type { ReactNode } from 'react';

interface CanProps { resource: Resource; action: Action; children: ReactNode; fallback?: ReactNode; }

export default function Can({ resource, action, children, fallback = null }: CanProps) {

  return usePermission(resource, action) ? <>{children}</> : <>{fallback}</>;

}
