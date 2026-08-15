import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import { ROUTES, GUIDE_ROUTE } from './routes';
import ProtectedRoute from '@/core/auth/guards/ProtectedRoute';
import MainLayout from '@/layout/MainLayout';
import PageErrorBoundary from '@/shared/components/PageErrorBoundary';

// All page imports are lazy — each route becomes its own JS chunk.
// Heavy libraries (recharts, jspdf, @mui/x-data-grid) only load when needed.
const Login              = lazy(() => import('@/features/auth/pages/Login'));
const ForgotPassword     = lazy(() => import('@/features/auth/pages/ForgotPassword'));
const ResetPassword      = lazy(() => import('@/features/auth/pages/ResetPassword'));
const Dashboard          = lazy(() => import('@/features/dashboard/pages/Dashboard'));
const Users              = lazy(() => import('@/features/users/pages/Users'));
const UserDetail         = lazy(() => import('@/features/users/pages/UserDetail'));
const UsersRoles         = lazy(() => import('@/features/users/pages/UsersRoles'));
const UsersPermissions   = lazy(() => import('@/features/users/pages/UsersPermissions'));
const Analytics          = lazy(() => import('@/features/analytics/pages/Analytics'));
const AnalyticsReports   = lazy(() => import('@/features/analytics/pages/AnalyticsReports'));
const Settings           = lazy(() => import('@/features/settings/pages/Settings'));
const SettingsNotifications = lazy(() => import('@/features/settings/pages/SettingsNotifications'));
const SettingsDatabase   = lazy(() => import('@/features/settings/pages/SettingsDatabase'));
const Profile            = lazy(() => import('@/features/profile/pages/Profile'));
const AuditLog           = lazy(() => import('@/features/audit/pages/AuditLog'));
const NotificationsPage  = lazy(() => import('@/features/notifications/pages/NotificationsPage'));
const InvitePage         = lazy(() => import('@/features/invite/InvitePage'));
const ReportsPage        = lazy(() => import('@/features/reports/pages/ReportsPage'));
const SystemHealth       = lazy(() => import('@/features/system/pages/SystemHealth'));
const DeveloperGuide     = lazy(() => import('@/features/guide/pages/DeveloperGuide'));
const DevDocsPage        = lazy(() => import('@/features/devdocs/pages/DevDocsPage'));
const UiDocsPage         = lazy(() => import('@/features/uidocs/pages/UiDocsPage'));
const AdvancedTableDemo  = lazy(() => import('@/features/tabledemo/pages/AdvancedTableDemo'));
const NotFound           = lazy(() => import('@/shared/pages/NotFound'));
const Unauthorized       = lazy(() => import('@/shared/pages/Unauthorized'));

function RouteSpinner() {
  return <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />;
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <MainLayout>
        <PageErrorBoundary>{children}</PageErrorBoundary>
      </MainLayout>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteSpinner />}>
      <Routes>
        <Route path={ROUTES.LOGIN}           element={<Login />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD}  element={<ResetPassword />} />

        <Route path={ROUTES.HOME}                          element={<Protected><Dashboard /></Protected>} />
        <Route path={ROUTES.PROFILE}                       element={<Protected><Profile /></Protected>} />
        <Route path={ROUTES.NOTIFICATIONS}                 element={<Protected><NotificationsPage /></Protected>} />
        <Route path={ROUTES.AUDIT}                         element={<Protected><AuditLog /></Protected>} />
        <Route path={ROUTES.INVITE}                        element={<Protected><InvitePage /></Protected>} />
        <Route path={ROUTES.REPORTS}                       element={<Protected><ReportsPage /></Protected>} />
        <Route path={ROUTES.SYSTEM}                        element={<Protected><SystemHealth /></Protected>} />
        <Route path={ROUTES.USERS}                         element={<Protected><Users /></Protected>} />
        <Route path={ROUTES.USERS_DETAIL}                  element={<Protected><UserDetail /></Protected>} />
        <Route path={ROUTES.USERS_ROLES}                   element={<Protected><UsersRoles /></Protected>} />
        <Route path={ROUTES.USERS_PERMISSIONS}             element={<Protected><UsersPermissions /></Protected>} />
        <Route path={ROUTES.ANALYTICS}                     element={<Protected><Analytics /></Protected>} />
        <Route path={ROUTES.ANALYTICS_REPORTS_MONTHLY}     element={<Protected><AnalyticsReports /></Protected>} />
        <Route path={ROUTES.ANALYTICS_REPORTS_QUARTERLY}   element={<Protected><AnalyticsReports /></Protected>} />
        <Route path={ROUTES.ANALYTICS_REPORTS_ANNUAL}      element={<Protected><AnalyticsReports /></Protected>} />
        <Route path={ROUTES.SETTINGS}                      element={<Protected><Settings /></Protected>} />
        <Route path={ROUTES.SETTINGS_NOTIFICATIONS}        element={<Protected><SettingsNotifications /></Protected>} />
        <Route path={ROUTES.SETTINGS_DATABASE}             element={<Protected><SettingsDatabase /></Protected>} />
        <Route path={GUIDE_ROUTE}                          element={<Protected><DeveloperGuide /></Protected>} />
        <Route path='/docs'                                element={<Protected><DevDocsPage /></Protected>} />
        <Route path='/ui-docs'                             element={<Protected><UiDocsPage /></Protected>} />
        <Route path={ROUTES.TABLE_DEMO}                    element={<Protected><AdvancedTableDemo /></Protected>} />
        <Route path="/403"                                 element={<Unauthorized />} />
        <Route path="*"                                    element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
