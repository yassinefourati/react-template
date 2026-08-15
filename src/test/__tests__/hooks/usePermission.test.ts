import { describe, it, expect } from 'vitest';
import { permissions } from '@/shared/types/roles';
import type { Role, Resource, Action } from '@/shared/types/roles';
vi.mock('@/core/api/client', () => ({ default: { post: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } }, setupInterceptors: vi.fn() }));
function can(role: Role, resource: Resource, action: Action) { return permissions[role]?.[resource]?.includes(action) ?? false; }
describe('permissions matrix', () => {
  it('admin has full user access', () => { expect(can('admin','users','delete')).toBe(true); expect(can('admin','settings.database','edit')).toBe(true); });
  it('editor cannot delete users', () => { expect(can('editor','users','delete')).toBe(false); expect(can('editor','users','edit')).toBe(true); });
  it('viewer is read-only', () => { expect(can('viewer','users','view')).toBe(true); expect(can('viewer','users','create')).toBe(false); expect(can('viewer','settings','edit')).toBe(false); });
});
