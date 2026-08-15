import { useQuery } from '@tanstack/react-query';
import { getAuditLog } from '../api/auditApi';
import { STALE } from '@/shared/lib/queryClient';
export function useAuditLog(page: number, severity?: string, search?: string) {
  return useQuery({ queryKey: ['audit', page, severity, search], queryFn: () => getAuditLog({ page, limit: 20, severity: severity || undefined, search: search || undefined }), staleTime: STALE.SHORT });
}
