import { useState } from 'react';
import {
  IconButton, Badge, Popover, Box, Typography, List,
  ListItemButton, ListItemText, Button, Divider, Chip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useMarkRead, useMarkAllRead } from '../hooks/useNotifications';
import { useNotificationSettings } from '@/features/settings/hooks/useNotifications';
import { ROUTES } from '@/core/router/routes';
import type { AppNotification } from '../api/notificationsApi';

// Keys are uppercase to match the backend enum.
const typeColor: Record<AppNotification['type'], 'info'|'success'|'warning'|'error'> = {
  INFO:    'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR:   'error',
};

export default function NotificationsBell() {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const { data, isLoading } = useNotifications();
  const { data: prefs } = useNotificationSettings();
  const { mutate: markRead } = useMarkRead();
  const { mutate: markAll }  = useMarkAllRead();
  const navigate = useNavigate();

  if (prefs?.inAppEnabled === false) return null;

  const unread = data?.unreadCount ?? 0;

  if (isLoading) {
    return (
      <IconButton color="inherit" disabled>
        <Badge><NotificationsIcon /></Badge>
      </IconButton>
    );
  }

  return (
    <>
      <IconButton color="inherit" onClick={(e) => setAnchor(e.currentTarget)}>
        <Badge badgeContent={unread} color="error" max={9}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: 360 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Notifications
              {unread > 0 && <Chip label={unread} size="small" color="error" sx={{ ml: 1 }} />}
            </Typography>
            {unread > 0 && (
              <IconButton size="small" onClick={() => markAll()} title="Mark all read">
                <DoneAllIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Divider />
          <List disablePadding sx={{ maxHeight: 320, overflow: 'auto' }}>
            {(data?.data ?? []).slice(0, 5).map((n) => (
              <ListItemButton
                key={n.id}
                onClick={() => { if (!n.read) markRead(n.id); }}
                sx={{ opacity: n.read ? 0.6 : 1, bgcolor: n.read ? 'transparent' : 'action.hover' }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {n.title}
                      <Chip
                        label={n.type.toLowerCase()}
                        size="small"
                        color={typeColor[n.type]}
                        sx={{ height: 18, fontSize: '0.6rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <span>{n.message}</span><br />
                      <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </>
                  }
                />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Button
              size="small"
              onClick={() => { navigate(ROUTES.NOTIFICATIONS); setAnchor(null); }}
            >
              View all notifications
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
}