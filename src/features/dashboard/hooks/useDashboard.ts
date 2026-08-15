import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDashboardStats, getDashboardOnline, getDashboardActivity, getRecentSignups } from '../api/dashboardApi';
import { STALE } from '@/shared/lib/queryClient';
import { useSSE } from '@/core/sse/useSSE';
import { useAuthStore } from '@/core/auth/stores/useAuthStore';

export function useDashboardStats()  { return useQuery({ queryKey:['dashboard','stats'],   queryFn: getDashboardStats,    staleTime: STALE.REALTIME, refetchInterval: STALE.REALTIME }); }
export function useOnlineCount()     { return useQuery({ queryKey:['dashboard','online'],  queryFn: getDashboardOnline,   staleTime: STALE.REALTIME, refetchInterval: STALE.REALTIME }); }
export function useRecentSignups()   { return useQuery({ queryKey:['dashboard','signups'], queryFn: getRecentSignups,     staleTime: STALE.SHORT }); }

export function useDashboardActivity() {
  const qc = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // SSE pushes new activity — fallback to polling in dev
  useSSE({
    url: '/api/dashboard/activity',
    enabled: isAuthenticated,
    onMessage: (data) => qc.setQueryData(['dashboard','activity'], data),
  });

  return useQuery({ queryKey:['dashboard','activity'], queryFn: getDashboardActivity, staleTime: STALE.REALTIME });
}
