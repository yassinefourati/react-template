import { Box, Typography, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
export default function UsersPermissions() { const { t } = useTranslation(); return <Box><Typography variant="h4" fontWeight={700} mb={3}>{t('menu.permissions')}</Typography><Alert severity="info">{t('common.comingSoon')}</Alert></Box>; }
