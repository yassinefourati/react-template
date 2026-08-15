import { useEffect } from 'react';
import { useWebSocketStore } from '@/shared/stores/useWebSocketStore';
import { useAuthStore } from '@/core/auth/stores/useAuthStore';
import { useAppStore } from '@/shared/stores/useAppStore';
import { queryClient } from '@/shared/lib/queryClient';
import type { AppNotification } from '../api/notificationsApi';

const NOTIFICATIONS_KEY = ['notifications'];

/**
 * Sets up the WebSocket connection and subscribes to the user's
 * private notification queue.
 *
 * Mount this once in AppProviders via <NotificationSocketWatcher />.
 * It handles connect, subscribe, cache update, and cleanup automatically.
 */
export function useNotificationSocket() {
    const { user, accessToken, isAuthenticated } = useAuthStore();
    const { connect, subscribe, disconnect, connected } = useWebSocketStore();
    const { notify } = useAppStore();

    // Connect when the user logs in, disconnect when they log out.
    useEffect(() => {
        if (isAuthenticated && accessToken) {
            connect(accessToken);
        } else {
            disconnect();
        }
        // Cleanup on unmount (app close / tab close)
        return () => { disconnect(); };
    }, [isAuthenticated, accessToken]);

    // Subscribe once connected.
    useEffect(() => {
        if (!connected || !user) return;

        const SEVERITY_MAP = {
            INFO: 'info',
            SUCCESS: 'success',
            WARNING: 'warning',
            ERROR: 'error',
        } as const;

        // Subscribe to this user's private queue
        // Server pushes to /user/{userId}/queue/notifications
        // which the STOMP client receives as /user/queue/notifications
        const subscription = subscribe(
            '/user/queue/notifications',
            (body: string) => {
                try {
                    const incoming = JSON.parse(body) as AppNotification;

                    // Inject into React Query cache immediately — no HTTP fetch needed,
                    // the bell updates in real time.
                    queryClient.setQueryData<{
                        data: AppNotification[];
                        unreadCount: number;
                    }>(NOTIFICATIONS_KEY, (old) => {
                        if (!old) {
                            return { data: [incoming], unreadCount: 1 };
                        }
                        return {
                            data: [incoming, ...old.data],
                            unreadCount: old.unreadCount + 1,
                        };
                    });

                    notify(
                        `${incoming.title}: ${incoming.message}`,
                        SEVERITY_MAP[incoming.type]
                    );

                } catch (e) {
                    console.error('[WS] Failed to parse notification:', e);
                }
            }
        );

        // Unsubscribe when disconnected or the user changes.
        return () => {
            subscription?.unsubscribe();
        };
    }, [connected, user]);
}