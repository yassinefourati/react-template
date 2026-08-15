import apiClient from '@/core/api/client';

export interface AuditEntry {
  id:         string;
  user:       string;
  action:     string;
  resource:   string;
  resourceId: string | null;
  ip:         string;
  timestamp:  string;
  severity:   'INFO' | 'WARNING' | 'ERROR';
}

// Shape of ApiResponse<T> envelope the backend returns
interface ApiMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

interface AuditApiResponse {
  status:    number;
  code:      string;
  message:   string;
  timestamp: string;
  data:      AuditEntry[];
  meta:      ApiMeta;
}

export const getAuditLog = (params: {
  page:      number;
  limit?:    number;
  severity?: string;
  search?:   string;
}) =>
  apiClient
    .get<AuditApiResponse>('/audit', { params })
    .then((r) => r.data);   // returns the full ApiResponse envelope