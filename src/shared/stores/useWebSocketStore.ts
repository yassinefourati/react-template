import { create } from 'zustand';
import { Client, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { env } from '@/core/config/env';

// Derive the WebSocket base URL from VITE_API_URL
// http://localhost:8080/api → http://localhost:8080
const WS_URL = env.VITE_API_URL.replace(/\/api$/, '');

interface WebSocketState {
  client:    Client | null;
  connected: boolean;
  connect:   (accessToken: string) => void;
  disconnect: () => void;
  subscribe: (
    destination: string,
    callback: (body: string) => void
  ) => StompSubscription | null;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  client:    null,
  connected: false,

  connect: (accessToken: string) => {
    // Never create a second client if already connected or connecting
    const existing = get().client;
    if (existing?.active) return;

    const client = new Client({
      // SockJS factory — matches the server's .withSockJS() config
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`),

      // JWT sent in STOMP CONNECT frame headers
      // WebSocketAuthInterceptor reads this on the server
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },

      // Auto-reconnect every 5 seconds if the connection drops
      reconnectDelay: 5000,

      onConnect: () => {
        set({ connected: true });
        console.debug('[WS] Connected');
      },

      onDisconnect: () => {
        set({ connected: false });
        console.debug('[WS] Disconnected');
      },

      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame.headers['message']);
        set({ connected: false });
      },

      // Silence the default verbose logging in production
      debug: env.DEV ? (msg) => console.debug('[WS]', msg) : () => {},
    });

    client.activate();
    set({ client });
  },

  disconnect: () => {
    const { client } = get();
    if (client?.active) {
      client.deactivate();
    }
    set({ client: null, connected: false });
  },

  subscribe: (destination, callback) => {
    const { client, connected } = get();
    if (!client || !connected) {
      console.warn('[WS] Cannot subscribe — not connected');
      return null;
    }
    return client.subscribe(destination, (message) => {
      callback(message.body);
    });
  },
}));