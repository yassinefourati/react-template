import axios from 'axios';
import { env } from '@/core/config/env';

/**
 * Token strategy:
 *  - Access token (15 min): stored in memory only (useAuthStore, NOT persisted)
 *  - Refresh token (7 days): httpOnly cookie set by server, never readable by JS
 *  - In dev/MSW: Bearer token fallback since MSW cannot set real httpOnly cookies
 */

let csrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  try {
    const response = await axios.get(
      `${env.VITE_API_URL}/csrf-token`,
      { withCredentials: true }
    );
    // ApiResponse<{token: string}> — token is at .data.data.token
    csrfToken = response.data?.data?.token ?? '';
    return csrfToken ?? '';
  } catch {
    // Fail silently — the backend will reject mutations with 403 if truly needed
    return '';
  }
}

const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 10_000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
type QueueItem = { resolve: (t: string) => void; reject: (e: unknown) => void };
let failedQueue: QueueItem[] = [];
function processQueue(err: unknown, token: string | null) {
  failedQueue.forEach((p) => err ? p.reject(err) : p.resolve(token ?? ''));
  failedQueue = [];
}

import { useTenantStore } from '@/shared/stores/useTenantStore';

export function setupInterceptors(
  getAccessToken: () => string | undefined,
  onLogout: () => void,
  onTokenRotated: (accessToken: string) => void,
) {
  apiClient.interceptors.request.use(async (config) => {
    // Dev: use Bearer token since MSW can't set httpOnly cookies
    const token = getAccessToken();
    if (token && env.DEV) config.headers.Authorization = `Bearer ${token}`;

    // Multi-tenancy: identify tenant on every request
    const tenantId = useTenantStore.getState().currentTenant.id;
    config.headers['X-Tenant-ID'] = tenantId;

    // CSRF on state-mutating methods
    if (['post','put','patch','delete'].includes(config.method ?? '')) {
      const csrf = await fetchCsrfToken();
      if (csrf) config.headers['X-CSRF-Token'] = csrf;
    }
    return config;
  });

  apiClient.interceptors.response.use(
    (res) => res,
    async (error: { response?: { status: number }; config: { _retry?: boolean; headers: Record<string, string> } }) => {
      const original = error.config;

      if (error.response?.status === 401 && !original._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => { failedQueue.push({ resolve, reject }); })
            .then((t) => { original.headers.Authorization = `Bearer ${t}`; return apiClient(original); });
        }

        original._retry = true;
        isRefreshing = true;

        try {
          const response = await apiClient.post('/auth/refresh');
          const newToken = response.data?.data?.accessToken; 
          onTokenRotated(newToken);
          processQueue(null, newToken);
          csrfToken = null;
          original.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(original);
        } catch (e) {
          processQueue(e, null);
          onLogout();
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}

export default apiClient;
