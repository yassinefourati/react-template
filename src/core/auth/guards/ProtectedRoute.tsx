import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/core/auth/stores/useAuthStore';
import { usePermission } from '@/shared/hooks/usePermission';
import { ROUTES } from '@/core/router/routes';
import type { Action, Resource } from '@/shared/types/roles';
import type { ReactNode } from 'react';

interface Props { children: ReactNode; resource?: Resource; action?: Action; }
export default function ProtectedRoute({ children, resource, action }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const allowed = usePermission(resource ?? 'users', action ?? 'view');
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (resource && !allowed) return <Navigate to='/403' replace />;
  return <>{children}</>;
}
