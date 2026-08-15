import { useQuery, useMutation } from '@tanstack/react-query';
import { getProfile, updateProfile, changePassword, getSessions, revokeSession, revokeAllSessions, setup2FA, verify2FA } from '../api/profileApi';
import { queryClient } from '@/shared/lib/queryClient';
import { useAppStore } from '@/shared/stores/useAppStore';
export function useProfile() { return useQuery({ queryKey: ['profile'], queryFn: getProfile }); }
export function useUpdateProfile() { const { notify } = useAppStore(); return useMutation({ mutationFn: updateProfile, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile'] }); notify('Profile updated', 'success'); } }); }
export function useChangePassword() { const { notify } = useAppStore(); return useMutation({ mutationFn: changePassword, onSuccess: () => notify('Password changed', 'success') }); }
export function useSessions() { return useQuery({ queryKey: ['sessions'], queryFn: getSessions }); }
export function useRevokeSession() { const { notify } = useAppStore(); return useMutation({ mutationFn: revokeSession, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sessions'] }); notify('Session revoked', 'success'); } }); }
export function useRevokeAllSessions() { const { notify } = useAppStore(); return useMutation({ mutationFn: revokeAllSessions, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sessions'] }); notify('All other sessions revoked', 'success'); } }); }
export function useSetup2FA() { return useMutation({ mutationFn: setup2FA }); }
export function useVerify2FA() { const { notify } = useAppStore(); return useMutation({ mutationFn: verify2FA, onSuccess: () => notify('2FA enabled successfully', 'success') }); }
