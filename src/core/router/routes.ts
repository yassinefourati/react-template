export const ROUTES = {
  HOME: '/', LOGIN: '/login',
  PROFILE: '/profile', FORGOT_PASSWORD: '/forgot-password', RESET_PASSWORD: '/reset-password',
  NOTIFICATIONS: '/notifications', AUDIT: '/audit',
  INVITE: '/invite', REPORTS: '/reports', SYSTEM: '/system',
  USERS: '/users', USERS_DETAIL: '/users/:id',
  USERS_ROLES: '/users/roles', USERS_PERMISSIONS: '/users/permissions',
  ANALYTICS: '/analytics',
  ANALYTICS_REPORTS_MONTHLY: '/analytics/reports/monthly',
  ANALYTICS_REPORTS_QUARTERLY: '/analytics/reports/quarterly',
  ANALYTICS_REPORTS_ANNUAL: '/analytics/reports/annual',
  SETTINGS: '/settings', SETTINGS_NOTIFICATIONS: '/settings/notifications', SETTINGS_DATABASE: '/settings/database',
  DOCS: '/docs',
  UI_DOCS: '/ui-docs',
  TABLE_DEMO: '/table-demo',
} as const;
export const GUIDE_ROUTE = '/developer-guide';
