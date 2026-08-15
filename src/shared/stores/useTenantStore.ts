import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tenant { id: string; name: string; domain: string; }

const DEFAULT_TENANTS: Tenant[] = [
  { id: 'tenant-1', name: 'Acme Corp', domain: 'acme.example.com' },
  { id: 'tenant-2', name: 'Beta Inc',  domain: 'beta.example.com' },
];

interface TenantState {
  currentTenant: Tenant;
  tenants: Tenant[];
  switchTenant: (id: string) => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      currentTenant: DEFAULT_TENANTS[0],
      tenants: DEFAULT_TENANTS,
      switchTenant: (id) => {
        const t = get().tenants.find((t) => t.id === id);
        if (t) set({ currentTenant: t });
      },
    }),
    { name: 'tenant-storage' }
  )
);
