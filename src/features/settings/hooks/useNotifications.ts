import { useQuery, useMutation } from '@tanstack/react-query';
import { getNotificationSettings, updateNotificationSettings, type NotificationSettings } from '../api/settingsApi';
import { queryClient } from '@/shared/lib/queryClient';
import { useAppStore } from '@/shared/stores/useAppStore';
const QUERY_KEY = ['settings', 'notifications'];
export function useNotificationSettings() { return useQuery({ queryKey: QUERY_KEY, queryFn: getNotificationSettings }); }
export function useUpdateNotifications() {
  const { notify } = useAppStore();
  return useMutation({ mutationFn: (body: Partial<NotificationSettings>) => updateNotificationSettings(body), onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); notify('Notification settings saved', 'success'); } });
}
