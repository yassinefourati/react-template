import { Grid, Typography, Box, Paper, List, ListItem, ListItemText, Chip, Skeleton, Stack } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useDashboardStats, useOnlineCount, useDashboardActivity, useRecentSignups } from '../hooks/useDashboard';
import StatCard from '../components/StatCard';
import SectionErrorBoundary from '@/shared/components/SectionErrorBoundary';
import PageHeader from '@/shared/components/PageHeader';

export default function Dashboard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: online }                         = useOnlineCount();
  const { data: activity, isLoading: actLoading }   = useDashboardActivity();
  const { data: signups,  isLoading: signupsLoading } = useRecentSignups();

  return (
    <Box>
      <PageHeader
        title={t('dashboard.title')}
        description="An overview of your workspace activity and key metrics."
        titleAdornment={online ? (
          <Chip icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: 'success.main' }} />}
            label={`${online.count} ${t('dashboard.online')}`} size="small" variant="outlined" color="success" />
        ) : <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 4 }} />}
      />

      {/* Stat cards — pass loading prop, no full-page skeleton */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs:12, sm:6, xl:3 }}>
          <StatCard title={t('dashboard.users')} value={stats?.users ?? 0} icon={<PeopleIcon />} color="#1976d2" loading={statsLoading}
            trend={stats ? { value: 8, label: 'vs last month' } : undefined} />
        </Grid>
        <Grid size={{ xs:12, sm:6, xl:3 }}>
          <StatCard title={t('dashboard.revenue')} value={stats ? `$${stats.revenue.toLocaleString()}` : ''} icon={<AttachMoneyIcon />} color="#2e7d32" loading={statsLoading}
            trend={stats ? { value: 12, label: 'vs last month' } : undefined} />
        </Grid>
        <Grid size={{ xs:12, sm:6, xl:3 }}>
          <StatCard title={t('dashboard.orders')} value={stats?.orders ?? 0} icon={<ShoppingCartIcon />} color="#ed6c02" loading={statsLoading}
            trend={stats ? { value: -3, label: 'vs last month' } : undefined} />
        </Grid>
        <Grid size={{ xs:12, sm:6, xl:3 }}>
          <StatCard title={t('dashboard.activeUsers')} value={stats?.activeUsers ?? 0} icon={<TrendingUpIcon />} color="#9c27b0" loading={statsLoading} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Signups mini chart */}
        <Grid size={{ xs:12, md:7 }}>
          <SectionErrorBoundary>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>{t('dashboard.signupsThisWeek')}</Typography>
              {signupsLoading
                ? <Skeleton variant="rounded" height={180} />
                : <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={signups} margin={{ top:5, right:10, left:0, bottom:5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="day" tick={{ fontSize:12 }} />
                      <YAxis tick={{ fontSize:12 }} />
                      <Tooltip />
                      <Bar dataKey="signups" fill={theme.palette.primary.main} radius={[4,4,0,0]}
                        animationDuration={800} animationEasing="ease-out" />
                    </BarChart>
                  </ResponsiveContainer>}
            </Paper>
          </SectionErrorBoundary>
        </Grid>

        {/* Live activity feed */}
        <Grid size={{ xs:12, md:5 }}>
          <SectionErrorBoundary>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1.5 }}>
                <Typography variant="subtitle1" fontWeight={700}>{t('dashboard.recentActivity')}</Typography>
                <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                  <FiberManualRecordIcon sx={{ fontSize:8, color:'success.main', animation: 'pulse 2s infinite', '@keyframes pulse':{ '0%,100%':{ opacity:1 }, '50%':{ opacity:0.3 } } }} />
                  <Typography variant="caption" color="text.secondary">live</Typography>
                </Box>
              </Box>
              {actLoading
                ? <Stack spacing={1}>{[1,2,3,4,5].map((i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{ opacity: 1 - i*0.12 }}>
                      <Skeleton variant="circular" width={28} height={28} />
                      <Box sx={{ flex:1 }}>
                        <Skeleton variant="text" height={16} />
                        <Skeleton variant="text" width="40%" height={12} />
                      </Box>
                    </Stack>
                  ))}</Stack>
                : !activity?.length
                ? <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No recent activity to show.</Typography>
                : <List disablePadding dense>
                    {activity?.map((item) => (
                      <ListItem key={item.id} disablePadding sx={{ py:0.5 }}>
                        <ListItemText
                          primary={<><strong>{item.user}</strong> {item.action}</>}
                          secondary={new Date(item.timestamp).toLocaleTimeString()}
                          primaryTypographyProps={{ fontSize:'0.82rem' }}
                          secondaryTypographyProps={{ fontSize:'0.72rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>}
            </Paper>
          </SectionErrorBoundary>
        </Grid>
      </Grid>
    </Box>
  );
}
