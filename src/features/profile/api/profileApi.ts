import apiClient from '@/core/api/client';
export interface ProfileData { id: number; name: string; email: string; role: string; avatarUrl: string; bio: string; phone: string; }
export interface Session { id: string; device: string; ip: string; lastActive: string; current: boolean; }
export const getProfile = () => apiClient.get<ProfileData>('/profile').then((r) => r.data);
export const updateProfile = (body: Partial<ProfileData>) => apiClient.put<ProfileData>('/profile', body).then((r) => r.data);
export const changePassword = (body: { currentPassword: string; newPassword: string }) => apiClient.put('/profile/password', body).then((r) => r.data);
export const getSessions = () => apiClient.get<Session[]>('/profile/sessions').then((r) => r.data);
export const revokeSession = (id: string) => apiClient.delete(`/profile/sessions/${id}`).then((r) => r.data);
export const revokeAllSessions = () => apiClient.delete('/profile/sessions').then((r) => r.data);
export const setup2FA = () => apiClient.post<{ qrCode: string; secret: string }>('/profile/2fa/setup').then((r) => r.data);
export const verify2FA = (code: string) => apiClient.post<{ success: boolean; backupCodes: string[] }>('/profile/2fa/verify', { code }).then((r) => r.data);
