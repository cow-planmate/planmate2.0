import { useCallback, useEffect, useRef, useState } from 'react';
import { getAccessToken, refreshTokens } from '../../../../shared/auth/tokenStore';

export interface ChatSocketEvent<T = unknown> {
  type: 'CONNECTED' | 'CHAT_MESSAGE' | 'CHAT_MESSAGE_DELETED' | 'CHAT_MESSAGE_HIDDEN' | 'PONG' | 'ERROR';
  payload: T;
}

const websocketBaseUrl = (): string => {
  const configured = import.meta.env.VITE_SOCIAL_WS_URL || import.meta.env.VITE_API_URL;
  const base = configured || window.location.origin;
  return base.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:').replace(/\/$/, '');
};

/** 채팅 모달이 열려 있는 동안만 Social 채팅 WebSocket을 유지한다. */
export const useChatWebSocket = (
  roomId: number | null,
  onEvent: (event: ChatSocketEvent) => void,
) => {
  const socketRef = useRef<WebSocket | null>(null);
  const eventHandlerRef = useRef(onEvent);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    eventHandlerRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (roomId === null) return;
    let stopped = false;
    let retry = 0;
    let reconnectTimer: number | undefined;
    let heartbeatTimer: number | undefined;

    const connect = async () => {
      const token = getAccessToken();
      if (!token || stopped) return;
      const socket = new WebSocket(
        `${websocketBaseUrl()}/ws/social/chat?token=${encodeURIComponent(token)}`,
      );
      socketRef.current = socket;
      socket.onopen = () => {
        retry = 0;
        setConnected(true);
        heartbeatTimer = window.setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'PING' }));
        }, 25_000);
      };
      socket.onmessage = (message) => {
        try {
          eventHandlerRef.current(JSON.parse(message.data) as ChatSocketEvent);
        } catch {
          // 알 수 없는 서버 이벤트는 다음 REST 동기화에서 복구한다.
        }
      };
      socket.onerror = () => socket.close();
      socket.onclose = async () => {
        setConnected(false);
        if (heartbeatTimer !== undefined) window.clearInterval(heartbeatTimer);
        if (stopped) return;
        if (retry === 0) await refreshTokens().catch(() => undefined);
        const delay = Math.min(30_000, 1_000 * 2 ** retry++);
        reconnectTimer = window.setTimeout(connect, delay);
      };
    };

    void connect();
    return () => {
      stopped = true;
      setConnected(false);
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
      if (heartbeatTimer !== undefined) window.clearInterval(heartbeatTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [roomId]);

  const send = useCallback((command: Record<string, unknown>): boolean => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(command));
    return true;
  }, []);

  return { connected, send };
};
