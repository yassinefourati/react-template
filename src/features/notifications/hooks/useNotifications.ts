import { useQuery, useMutation } from '@tanstack/react-query';
import { getNotifications, markRead, markAllRead } from '../api/notificationsApi';
import { useNotificationSettings } from '@/features/settings/hooks/useNotifications';
import { queryClient, STALE } from '@/shared/lib/queryClient';

const KEY = ['notifications'];

export function useNotifications() {
  const { data: prefs } = useNotificationSettings();
  const enabled = prefs?.inAppEnabled ?? true;

  return useQuery({
    queryKey: KEY,
    queryFn:  getNotifications,
    staleTime: STALE.MEDIUM,         // ← was STALE.REALTIME + refetchInterval
    // No refetchInterval — WebSocket pushes updates directly into the cache
    // REST fetch still happens once on mount to load any missed notifications
    enabled,
  });
}

export function useMarkRead() {
  return useMutation({
    mutationFn: markRead,
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useMarkAllRead() {
  return useMutation({
    mutationFn: markAllRead,
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}