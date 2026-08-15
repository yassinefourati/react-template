import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/core/auth/stores/useAuthStore';
vi.mock('@/core/api/client', () => ({ default: { post: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } }, setupInterceptors: vi.fn() }));
import apiClient from '@/core/api/client';
const mockPost = vi.mocked(apiClient.post);
const adminUser = { id: 1, name: 'Alice', email: 'admin@demo.com', role: 'admin' as const };
describe('useAuthStore', () => {
  beforeEach(() => { useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false }); vi.clearAllMocks(); });
  it('sets user on successful login', async () => {
    mockPost.mockResolvedValueOnce({ data: { token: 'tok-123', user: adminUser } });
    await useAuthStore.getState().login('admin@demo.com', 'password');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.token).toBe('tok-123');
  });
  it('clears isLoading after failure', async () => {
    mockPost.mockRejectedValueOnce(new Error('Invalid credentials'));
    try { await useAuthStore.getState().login('bad@email.com', 'wrong'); } catch { /* expected */ }
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
  it('logout clears user', async () => {
    mockPost.mockResolvedValueOnce({ data: { token: 'tok', user: adminUser } });
    await useAuthStore.getState().login('admin@demo.com', 'password');
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
