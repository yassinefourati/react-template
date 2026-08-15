import { z } from 'zod';
import apiClient from '@/core/api/client';
import { validated } from '@/core/api/validate';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  status: z.enum(['active', 'disabled']).default('active'),
  bio: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const MetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

const UserListSchema = z.object({
  status: z.number(),
  code: z.string(),
  message: z.string(),
  data: z.array(UserSchema),
  meta: MetaSchema,
});

export type User = z.infer<typeof UserSchema>;
export type UserPayload = Pick<User, 'name' | 'email' | 'role'>;

export interface UserFilters {
  search?: string;
  role?: string;
  status?: User['status'] | '';
}

export const getUsers = (page: number, limit = 10, filters: UserFilters = {}) =>
  apiClient
    .get('/users', { params: {
      page, limit,
      search: filters.search || undefined,
      role: filters.role || undefined,
      status: filters.status || undefined,
    } })
    .then((r) => validated(UserListSchema)(r.data));

export const createUser = (body: UserPayload) =>
  apiClient.post('/users', body).then((r) => validated(UserSchema)(r.data));

export const updateUser = (id: string, body: Partial<UserPayload> & { status?: User['status'] }) =>
  apiClient.put(`/users/${id}`, body).then((r) => validated(UserSchema)(r.data));

export const deleteUser = (id: string) =>
  apiClient.delete(`/users/${id}`).then((r) => r.data);
