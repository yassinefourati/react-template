import apiClient from '@/core/api/client';
export interface NotificationSettings { emailEnabled: boolean; pushEnabled: boolean; inAppEnabled: boolean; weeklyDigest: boolean; securityAlerts: boolean; }
export const getNotificationSettings = () => apiClient.get<NotificationSettings>('/settings/notifications').then((r) => r.data);
export const updateNotificationSettings = (body: Partial<NotificationSettings>) => apiClient.put<NotificationSettings>('/settings/notifications', body).then((r) => r.data);
