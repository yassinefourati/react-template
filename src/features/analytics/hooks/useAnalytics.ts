import { useQuery } from '@tanstack/react-query';
import { getAnalyticsOverview, getRetention, getGeography, getFunnel } from '../api/analyticsApi';
export function useAnalyticsOverview(from?: string, to?: string) {
  return useQuery({ queryKey: ['analytics','overview', from, to], queryFn: () => getAnalyticsOverview(from, to) });
}
export function useRetention()  { return useQuery({ queryKey: ['analytics','retention'],  queryFn: getRetention }); }
export function useGeography()  { return useQuery({ queryKey: ['analytics','geography'],  queryFn: getGeography }); }
export function useFunnel()     { return useQuery({ queryKey: ['analytics','funnel'],     queryFn: getFunnel }); }
