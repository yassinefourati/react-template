import { Box, Typography, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAnalyticsOverview } from '../hooks/useAnalytics';

const PERIOD_MAP: Record<string, { label: string; from: string; to: string }> = {
  monthly:   { label: 'Monthly Report',   from: '2024-01-01', to: '2024-01-31' },
  quarterly: { label: 'Quarterly Report', from: '2024-01-01', to: '2024-03-31' },
  annual:    { label: 'Annual Report',    from: '2024-01-01', to: '2024-12-31' },
};

export default function AnalyticsReports() {
  const { t }  = useTranslation();
  const theme  = useTheme();
  const { pathname } = useLocation();
  const period = pathname.split('/').pop() ?? 'monthly';
  const meta   = PERIOD_MAP[period] ?? PERIOD_MAP.monthly;

  const { data, isLoading } = useAnalyticsOverview(meta.from, meta.to);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>{meta.label}</Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={2}>Revenue</Typography>
        {!isLoading && (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data?.revenue} margin={{ top:5, right:20, left:0, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="month" tick={{ fontSize:12 }} />
              <YAxis tick={{ fontSize:12 }} tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Legend />
              <Bar dataKey="value" name="Revenue" fill={theme.palette.primary.main} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={2}>Signups</Typography>
        {!isLoading && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.signups} margin={{ top:5, right:20, left:0, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="month" tick={{ fontSize:12 }} />
              <YAxis tick={{ fontSize:12 }} />
              <Tooltip /><Legend />
              <Bar dataKey="value" name={t('menu.monthly')} fill={theme.palette.secondary?.main ?? '#9c27b0'} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </Box>
  );
}
