export type Role = 'admin' | 'editor' | 'viewer';
export type Action = 'view' | 'create' | 'edit' | 'delete';
export type Resource = 'users' | 'users.roles' | 'users.permissions' | 'analytics' | 'settings' | 'settings.notifications' | 'settings.database';

export const permissions: Record<Role, Partial<Record<Resource, Action[]>>> = {
  admin: {
    users: ['view', 'create', 'edit', 'delete'],
    'users.roles': ['view', 'create', 'edit', 'delete'],
    'users.permissions': ['view', 'create', 'edit', 'delete'],
    analytics: ['view'], settings: ['view', 'edit'],
    'settings.notifications': ['view', 'edit'], 'settings.database': ['view', 'edit'],
  },
  editor: {
    users: ['view', 'create', 'edit'], 'users.roles': ['view'],
    'users.permissions': ['view'], analytics: ['view'],
    settings: ['view', 'edit'], 'settings.notifications': ['view', 'edit'], 'settings.database': [],
  },
  viewer: {
    users: ['view'], 'users.roles': ['view'], 'users.permissions': ['view'],
    analytics: ['view'], settings: ['view'], 'settings.notifications': ['view'], 'settings.database': [],
  },
};
