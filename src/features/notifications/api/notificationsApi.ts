import apiClient from '@/core/api/client';

// Type matches backend enum exactly (uppercase).
export interface AppNotification {
  id:        string;
  title:     string;
  message:   string;
  read:      boolean;
  type:      'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  createdAt: string;
}

// ApiResponse<T> envelope shape from backend.
interface NotificationsEnvelope {
  status:      number;
  code:        string;
  message:     string;
  timestamp:   string;
  data:        AppNotification[];
  unreadCount: number;   // backend NotificationsResponse has this at the root data level
}

export const getNotifications = () =>
  apiClient
    .get<NotificationsEnvelope>('/notifications')
    .then((r) => r.data);   // returns { data: [...], unreadCount: N }

export const markRead    = (id: string) =>
  apiClient.put(`/notifications/${id}/read`).then((r) => r.data);

export const markAllRead = () =>
  apiClient.put('/notifications/read-all').then((r) => r.data);