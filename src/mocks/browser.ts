import { setupWorker } from 'msw/browser';
import { authHandlers }          from './handlers/authHandlers';
import { usersHandlers }         from './handlers/usersHandlers';
import { dashboardHandlers }     from './handlers/dashboardHandlers';
import { analyticsHandlers }     from './handlers/analyticsHandlers';
import { settingsHandlers }      from './handlers/settingsHandlers';
import { profileHandlers }       from './handlers/profileHandlers';
import { auditHandlers }         from './handlers/auditHandlers';
import { notificationsHandlers } from './handlers/notificationsHandlers';
import { inviteHandlers }        from './handlers/inviteHandlers';
import { reportsHandlers }       from './handlers/reportsHandlers';
import { systemHandlers }        from './handlers/systemHandlers';

export const worker = setupWorker(
  ...authHandlers, ...usersHandlers, ...dashboardHandlers,
  ...analyticsHandlers, ...settingsHandlers, ...profileHandlers,
  ...auditHandlers, ...notificationsHandlers, ...inviteHandlers,
  ...reportsHandlers, ...systemHandlers,
);
