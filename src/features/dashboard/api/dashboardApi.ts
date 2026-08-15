import apiClient from '@/core/api/client';
export interface DashboardStats { users: number; revenue: number; orders: number; activeUsers: number; }
export interface ActivityItem  { id: string; user: string; action: string; timestamp: string; }
export interface SignupPoint    { day: string; signups: number; }
export const getDashboardStats    = () => apiClient.get<DashboardStats>('/dashboard/stats').then((r) => r.data);
export const getDashboardOnline   = () => apiClient.get<{ count: number }>('/dashboard/online').then((r) => r.data);
export const getDashboardActivity = () => apiClient.get<ActivityItem[]>('/dashboard/activity').then((r) => r.data);
export const getRecentSignups     = () => apiClient.get<SignupPoint[]>('/dashboard/recent-signups').then((r) => r.data);
