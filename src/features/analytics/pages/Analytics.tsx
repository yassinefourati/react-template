import { Box, Typography, Grid, Paper, Skeleton, Stack, Button, ButtonGroup, Table, TableHead, TableBody, TableRow, TableCell, LinearProgress } from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAnalyticsOverview, useRetention, useGeography, useFunnel } from '../hooks/useAnalytics';
import AnalyticsSkeleton from '@/shared/components/skeletons/AnalyticsSkeleton';
import SectionErrorBoundary from '@/shared/components/SectionErrorBoundary';

function ChartCard({ title, children, loading, height = 260 }: { title: string; children: React.ReactNode; loading?: boolean; height?: number }) {
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} mb={2}>{title}</Typography>
      {loading ? <Skeleton variant="rounded" height={height} sx={{ animationDelay: '0.1s' }} /> : children}
    </Paper>
  );
}

const RANGES = [
  { label: '6M', from: '2024-01-01', to: '2024-06-30' },
  { label: '12M', from: undefined, to: undefined },
];

export default function Analytics() {
  const { t } = useTranslation();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const [rangeIdx, setRangeIdx] = useState(1);
  const range = RANGES[rangeIdx];

  const { data: overview, isLoading: ovLoading }   = useAnalyticsOverview(range.from, range.to);
  const { data: cohorts,  isLoading: cohortLoading } = useRetention();
  const { data: geo,      isLoading: geoLoading }    = useGeography();
  const { data: funnel,   isLoading: funnelLoading }  = useFunnel();

  // Show page skeleton only on very first load (no data at all)
  if (ovLoading && !overview) return <AnalyticsSkeleton />;

  const maxFunnel = funnel?.[0]?.value ?? 1;

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
        <Typography variant="h4" fontWeight={700}>{t('analytics.title')}</Typography>
        <ButtonGroup size="small" variant="outlined">
          {RANGES.map((r, i) => (
            <Button key={r.label} variant={rangeIdx === i ? 'contained' : 'outlined'} onClick={() => setRangeIdx(i)}>
              {r.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs:12, lg:8 }}>
          <SectionErrorBoundary>
            <ChartCard title="Monthly Revenue ($)" loading={ovLoading}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={overview?.revenue} margin={{ top:5, right:20, left:0, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="month" tick={{ fontSize:12 }} />
                  <YAxis tick={{ fontSize:12 }} tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="value" stroke={primary} strokeWidth={2.5} dot={{ r:4 }} activeDot={{ r:6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </SectionErrorBoundary>
        </Grid>

        <Grid size={{ xs:12, lg:4 }}>
          <SectionErrorBoundary>
            <ChartCard title="Top Pages" loading={ovLoading}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart layout="vertical" data={overview?.topPages} margin={{ top:5, right:20, left:60, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis type="number" tick={{ fontSize:11 }} />
                  <YAxis type="category" dataKey="page" tick={{ fontSize:11 }} width={55} />
                  <Tooltip />
                  <Bar dataKey="views" fill={theme.palette.mode === 'dark' ? '#90caf9' : '#42a5f5'} radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </SectionErrorBoundary>
        </Grid>

        <Grid size={{ xs:12, lg:6 }}>
          <SectionErrorBoundary>
            <ChartCard title="Monthly Signups" loading={ovLoading} height={200}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={overview?.signups} margin={{ top:5, right:20, left:0, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="month" tick={{ fontSize:12 }} />
                  <YAxis tick={{ fontSize:12 }} />
                  <Tooltip /><Legend />
                  <Bar dataKey="value" name="Signups" fill={primary} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </SectionErrorBoundary>
        </Grid>

        <Grid size={{ xs:12, lg:6 }}>
          <SectionErrorBoundary>
            <ChartCard title="Conversion Funnel" loading={funnelLoading} height={200}>
              <Stack spacing={1}>
                {funnel?.map((row, i) => (
                  <Box key={row.stage}>
                    <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                      <Typography variant="caption">{row.stage}</Typography>
                      <Typography variant="caption" fontWeight={600}>{row.value.toLocaleString()} ({Math.round((row.value/maxFunnel)*100)}%)</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(row.value/maxFunnel)*100}
                      sx={{ height:28, borderRadius:1, bgcolor:'action.hover', '& .MuiLinearProgress-bar': { bgcolor:`hsl(${210+i*15},70%,${55-i*5}%)`, transition: 'transform 1s ease' } }} />
                  </Box>
                ))}
              </Stack>
            </ChartCard>
          </SectionErrorBoundary>
        </Grid>

        <Grid size={{ xs:12, lg:7 }}>
          <SectionErrorBoundary>
            <ChartCard title="User Retention Cohort" loading={cohortLoading} height={220}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight:700 }}>Cohort</TableCell>
                    {['Week 1','Week 2','Week 4','Week 8','Week 12'].map((w) => (
                      <TableCell key={w} align="center" sx={{ fontWeight:700 }}>{w}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cohorts?.map((row) => (
                    <TableRow key={row.cohort}>
                      <TableCell>{row.cohort}</TableCell>
                      {[row.w1,row.w2,row.w4,row.w8,row.w12].map((v, i) => (
                        <TableCell key={i} align="center" sx={{
                          bgcolor: `rgba(25,118,210,${v/100*0.6})`,
                          fontWeight: 600, fontSize:'0.8rem',
                          transition: 'background-color 0.4s ease',
                        }}>{v}%</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ChartCard>
          </SectionErrorBoundary>
        </Grid>

        <Grid size={{ xs:12, lg:5 }}>
          <SectionErrorBoundary>
            <ChartCard title="Users by Country" loading={geoLoading} height={220}>
              <Stack spacing={1.5}>
                {geo?.map((row) => (
                  <Box key={row.country}>
                    <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                      <Typography variant="body2">{row.country}</Typography>
                      <Typography variant="body2" fontWeight={600}>{row.users.toLocaleString()} ({row.pct}%)</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={row.pct} sx={{ height:8, borderRadius:4, '& .MuiLinearProgress-bar':{ transition:'transform 0.8s ease' } }} />
                  </Box>
                ))}
              </Stack>
            </ChartCard>
          </SectionErrorBoundary>
        </Grid>
      </Grid>
    </Box>
  );
}
