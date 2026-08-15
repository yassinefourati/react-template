import { Box, Typography, Paper, Stack, Switch, Divider, Skeleton, Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNotificationSettings, useUpdateNotifications } from '../hooks/useNotifications';
import type { NotificationSettings } from '../api/settingsApi';
import { useMemo, useState } from 'react';
const TOGGLES: { key: keyof NotificationSettings; label: string; description: string }[] = [
  { key:'emailEnabled', label:'Email notifications', description:'Receive updates via email' },
  { key:'pushEnabled', label:'Push notifications', description:'Browser push alerts' },
  { key:'inAppEnabled', label:'In-app notifications', description:'Show alerts inside the app' },
  { key:'weeklyDigest', label:'Weekly digest', description:'Summary email every Monday' },
  { key:'securityAlerts', label:'Security alerts', description:'Login and permission change alerts' },
];
export default function SettingsNotifications() {
  const { t } = useTranslation(); const { data, isLoading } = useNotificationSettings(); const { mutate: save, isPending } = useUpdateNotifications();
  const [overrides, setOverrides] = useState<Partial<NotificationSettings>>({});
  const merged = useMemo<NotificationSettings | null>(() => data ? { ...data, ...overrides } : null, [data, overrides]);
  return (
    <Box><Typography variant="h4" fontWeight={700} mb={3}>{t('settings.notifications')}</Typography>
    <Paper elevation={2} sx={{ borderRadius: 3, maxWidth: 560 }}>
      <Stack divider={<Divider />}>
        {TOGGLES.map(({ key, label, description }) => (
          <Box key={key} sx={{ px:3, py:2, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <Box>{isLoading ? <><Skeleton width={160} height={20} /><Skeleton width={220} height={16} /></> : <><Typography variant="body2" fontWeight={600}>{label}</Typography><Typography variant="caption" color="text.secondary">{description}</Typography></>}</Box>
            {isLoading ? <Skeleton variant="rounded" width={44} height={24} /> : <Switch checked={merged?.[key] ?? false} onChange={() => setOverrides((p) => ({ ...p, [key]: !merged?.[key] }))} size="small" />}
          </Box>
        ))}
      </Stack>
      <Box sx={{ px:3, py:2, borderTop:'1px solid', borderColor:'divider' }}>
        <Button variant="contained" onClick={() => merged && save(merged)} disabled={isPending || isLoading || !merged} startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : null}>{t('settings.save')}</Button>
      </Box>
    </Paper></Box>
  );
}
