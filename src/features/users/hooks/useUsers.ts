import { useQuery, useMutation } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser, type UserPayload, type User, type UserFilters } from '../api/usersApi';
import apiClient from '@/core/api/client';
import { queryClient, STALE } from '@/shared/lib/queryClient';
import { useAppStore } from '@/shared/stores/useAppStore';

const KEY = 'users';

type UsersPage = {
  data: User[];
  meta: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
};

export function useUsers(page: number, limit = 10, filters: UserFilters = {}) {
  return useQuery({
    queryKey: [KEY, page, limit, filters.search ?? '', filters.role ?? '', filters.status ?? ''],
    queryFn: () => getUsers(page, limit, filters),
    staleTime: STALE.SHORT,
  });
}

export function useCreateUser() {
  const { notify } = useAppStore();
  return useMutation({
    mutationFn: (body: UserPayload) => createUser(body),
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: [KEY] });
      const prev = queryClient.getQueriesData<UsersPage>({ queryKey: [KEY] });
      queryClient.setQueriesData<UsersPage>({ queryKey: [KEY] }, (old) =>
        old ? { ...old, data: [{ id: `temp-${Date.now()}`, ...newUser, status: 'active' as const, bio: null, phone: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...old.data], meta: { ...old.meta, total: old.meta.total + 1 } } : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { ctx?.prev.forEach(([key, val]) => queryClient.setQueryData(key, val)); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [KEY] }); notify('User created', 'success'); },
  });
}

export function useUpdateUser() {
  const { notify } = useAppStore();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<UserPayload> & { status?: User['status'] } }) => updateUser(id, body),
    onMutate: async ({ id, body }) => {
      await queryClient.cancelQueries({ queryKey: [KEY] });
      const prev = queryClient.getQueriesData<UsersPage>({ queryKey: [KEY] });
      queryClient.setQueriesData<UsersPage>({ queryKey: [KEY] }, (old) =>
        old ? { ...old, data: old.data.map((u) => u.id === id ? { ...u, ...body } : u) } : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { ctx?.prev.forEach(([key, val]) => queryClient.setQueryData(key, val)); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [KEY] }); notify('User updated', 'success'); },
  });
}

export function useDeleteUser() {
  const { notify } = useAppStore();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [KEY] });
      const prev = queryClient.getQueriesData<UsersPage>({ queryKey: [KEY] });
      queryClient.setQueriesData<UsersPage>({ queryKey: [KEY] }, (old) =>
        old ? { ...old, data: old.data.filter((u) => u.id !== id), meta: { ...old.meta, total: old.meta.total - 1 } } : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { ctx?.prev.forEach(([key, val]) => queryClient.setQueryData(key, val)); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [KEY] }); notify('User deleted', 'success'); },
  });
}

export function useBulkDeleteUsers() {
  const { notify } = useAppStore();
  return useMutation({
    mutationFn: (ids: string[]) => apiClient.delete('/users', { data: { ids } }).then((r) => r.data),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: [KEY] });
      const prev = queryClient.getQueriesData<UsersPage>({ queryKey: [KEY] });
      queryClient.setQueriesData<UsersPage>({ queryKey: [KEY] }, (old) =>
        old ? { ...old, data: old.data.filter((u) => !ids.includes(u.id)), meta: { ...old.meta, total: old.meta.total - ids.length } } : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { ctx?.prev.forEach(([key, val]) => queryClient.setQueryData(key, val)); },
    onSuccess: (_, ids) => { queryClient.invalidateQueries({ queryKey: [KEY] }); notify(`${ids.length} users deleted`, 'success'); },
  });
}

export function useBulkUpdateRole() {
  const { notify } = useAppStore();
  return useMutation({
    mutationFn: ({ ids, role }: { ids: string[]; role: string }) =>
      Promise.all(ids.map((id) => updateUser(id, { role }))),
    onMutate: async ({ ids, role }) => {
      await queryClient.cancelQueries({ queryKey: [KEY] });
      const prev = queryClient.getQueriesData<UsersPage>({ queryKey: [KEY] });
      queryClient.setQueriesData<UsersPage>({ queryKey: [KEY] }, (old) =>
        old ? { ...old, data: old.data.map((u) => ids.includes(u.id) ? { ...u, role } : u) } : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { ctx?.prev.forEach(([key, val]) => queryClient.setQueryData(key, val)); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [KEY] }); notify('Roles updated', 'success'); },
  });
}
