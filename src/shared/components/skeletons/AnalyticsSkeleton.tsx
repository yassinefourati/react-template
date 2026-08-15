import { Box, Paper, Skeleton, Stack, Grid } from '@mui/material';
function ChartCardSkeleton({ height = 260 }: { height?: number }) {
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
      <Skeleton variant="text" width={200} height={24} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={height} />
    </Paper>
  );
}
export default function AnalyticsSkeleton() {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Skeleton variant="text" width={160} height={44} />
        <Skeleton variant="rounded" width={120} height={32} />
      </Stack>
      <Grid container spacing={3}>
        <Grid size={{ xs:12, lg:8 }}><ChartCardSkeleton /></Grid>
        <Grid size={{ xs:12, lg:4 }}><ChartCardSkeleton /></Grid>
        <Grid size={{ xs:12, lg:6 }}><ChartCardSkeleton height={200} /></Grid>
        <Grid size={{ xs:12, lg:6 }}><ChartCardSkeleton height={200} /></Grid>
        <Grid size={{ xs:12, lg:7 }}><ChartCardSkeleton height={220} /></Grid>
        <Grid size={{ xs:12, lg:5 }}><ChartCardSkeleton height={220} /></Grid>
      </Grid>
    </Box>
  );
}
