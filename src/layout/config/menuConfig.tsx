import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import FolderIcon from '@mui/icons-material/Folder';
import ShieldIcon from '@mui/icons-material/Shield';
import TuneIcon from '@mui/icons-material/Tune';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StorageIcon from '@mui/icons-material/Storage';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useTranslation } from 'react-i18next';
import { ROUTES, GUIDE_ROUTE } from '@/core/router/routes';
import type { ReactNode } from 'react';
export interface MenuItem { label: string; icon?: ReactNode; path?: string; children?: MenuItem[]; dividerBefore?: boolean; }
export function useMenuConfig(): MenuItem[] {
  const { t } = useTranslation();
  return [
    { label: t('menu.dashboard'), icon: <DashboardIcon />, path: ROUTES.HOME },
    { label: t('menu.users'), icon: <PeopleIcon />, children: [
      { label: t('menu.allUsers'), icon: <GroupIcon />, path: ROUTES.USERS },
      { label: t('menu.roles'), icon: <ShieldIcon />, path: ROUTES.USERS_ROLES },
      { label: t('menu.permissions'), icon: <ShieldIcon />, path: ROUTES.USERS_PERMISSIONS },
    ]},
    { label: t('menu.analytics'), icon: <BarChartIcon />, children: [
      { label: t('menu.overview'), path: ROUTES.ANALYTICS },
      { label: t('menu.reports'), icon: <FolderIcon />, children: [
        { label: t('menu.monthly'), path: ROUTES.ANALYTICS_REPORTS_MONTHLY },
        { label: t('menu.quarterly'), path: ROUTES.ANALYTICS_REPORTS_QUARTERLY },
        { label: t('menu.annual'), path: ROUTES.ANALYTICS_REPORTS_ANNUAL },
      ]},
    ]},
    { label: t('menu.settings'), icon: <SettingsIcon />, children: [
      { label: t('menu.general'), icon: <TuneIcon />, path: ROUTES.SETTINGS },
      { label: t('menu.notifications'), icon: <NotificationsIcon />, path: ROUTES.SETTINGS_NOTIFICATIONS },
      { label: t('menu.database'), icon: <StorageIcon />, path: ROUTES.SETTINGS_DATABASE },
    ]},
    { label: 'Audit Log', icon: <AssignmentIcon />, path: ROUTES.AUDIT, dividerBefore: true },
    { label: 'Advanced Table Demo', icon: <TableChartIcon />, path: ROUTES.TABLE_DEMO },
    { label: 'Profile', icon: <PersonIcon />, path: ROUTES.PROFILE },
    { label: 'Dev Guide', icon: <MenuBookIcon />, path: GUIDE_ROUTE },
    { label: 'Dev Docs', icon: <MenuBookIcon />, path: '/docs' },
    { label: 'UI Library', icon: <MenuBookIcon />, path: '/ui-docs' },
  ];
}
