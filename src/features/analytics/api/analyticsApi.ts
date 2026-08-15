import apiClient from '@/core/api/client';
export interface DataPoint  { month: string; value: number }
export interface TopPage    { page: string; views: number }
export interface CohortRow  { cohort: string; w1: number; w2: number; w4: number; w8: number; w12: number; }
export interface GeoRow     { country: string; users: number; pct: number; }
export interface FunnelRow  { stage: string; value: number; }
export interface AnalyticsOverview { revenue: DataPoint[]; signups: DataPoint[]; topPages: TopPage[]; }
export const getAnalyticsOverview = (from?: string, to?: string) =>
  apiClient.get<AnalyticsOverview>('/analytics/overview', { params: { from, to } }).then((r) => r.data);
export const getRetention  = () => apiClient.get<CohortRow[]>('/analytics/retention').then((r) => r.data);
export const getGeography  = () => apiClient.get<GeoRow[]>('/analytics/geography').then((r) => r.data);
export const getFunnel     = () => apiClient.get<FunnelRow[]>('/analytics/funnel').then((r) => r.data);
