import { Box, Typography, Paper, List, ListItem, ListItemText, Chip, Button, Divider, Skeleton, Stack } from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNotifications, useMarkRead, useMarkAllRead } from '../hooks/useNotifications';

const typeColor = { info: 'info', success: 'success', warning: 'warning', error: 'error' } as const;

function NotificationSkeleton() {
  return (
    <Stack spacing={0} divider={<Divider />}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i} sx={{ px: 2, py: 2, opacity: 1 - i * 0.1 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <Skeleton variant="text" width={160} height={20} />
            <Skeleton variant="rounded" width={50} height={20} sx={{ borderRadius: 4 }} />
          </Stack>
          <Skeleton variant="text" width="80%" height={16} />
          <Skeleton variant="text" width={100} height={14} />
        </Box>
      ))}
    </Stack>
  );
}

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const { mutate: markRead } = useMarkRead();
  const { mutate: markAll } = useMarkAllRead();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Notifications</Typography>
        <Button
          startIcon={<DoneAllIcon />}
          onClick={() => markAll()}
          disabled={isLoading || !data?.unreadCount}
        >
          Mark all read
        </Button>
      </Box>
      <Paper elevation={2} sx={{ borderRadius: 3 }}>
        {isLoading ? (
          <NotificationSkeleton />
        ) : (
          <List disablePadding>
            {data?.data.map((n, i) => (
              <Box key={n.id}>
                {i > 0 && <Divider />}
                <ListItem
                  sx={{ py: 2, bgcolor: n.read ? 'transparent' : 'action.hover', cursor: n.read ? 'default' : 'pointer' }}
                  onClick={() => { if (!n.read) markRead(n.id); }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2">{n.title}</Typography>
                        <Chip label={n.type} size="small" color={typeColor[n.type]} />
                        {!n.read && <Chip label="New" size="small" color="primary" />}
                      </Box>
                    }
                    secondary={
                      <>
                        <span>{n.message}</span>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(n.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
