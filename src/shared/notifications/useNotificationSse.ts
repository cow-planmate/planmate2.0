import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getAccessToken, refreshTokens } from '../auth/tokenStore';

const BASE_URL: string =
  import.meta.env.VITE_NOTIFICATION_API_URL || import.meta.env.VITE_API_URL;

/**
 * 통합 알림 스트림. Social 채팅 SSE(useSocialSse)와는 별개의 연결이다 —
 * 채팅 이벤트는 여전히 Social 이 소유하므로 두 스트림을 각각 구독한다.
 *
 * SSE 는 놓쳐도 되는 채널로 다룬다. 끊긴 동안의 알림은 재연결 시 Last-Event-ID 로 서버가
 * 재생하고, 그마저 놓치면 목록 재조회로 복구된다.
 */
export const useNotificationSse = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let source: EventSource | null = null;
    let retryTimer: number | undefined;
    let retry = 0;
    let stopped = false;
    // 재연결 시 서버가 이 id 이후 알림만 다시 보내준다. EventSource 의 자동 Last-Event-ID 는
    // 우리가 직접 close/재생성하는 재연결에는 실려가지 않으므로 쿼리 파라미터로도 넘긴다.
    let lastEventId: string | null = null;

    const connect = async () => {
      const token = getAccessToken();
      if (!token || stopped) return;

      const params = new URLSearchParams({ token });
      if (lastEventId) params.set('lastEventId', lastEventId);
      source = new EventSource(`${BASE_URL}/api/notifications/sse/subscribe?${params}`);

      source.addEventListener('notification', (event) => {
        const message = event as MessageEvent;
        if (message.lastEventId) lastEventId = message.lastEventId;
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });
      source.onopen = () => {
        retry = 0;
        // 연결이 끊겨 있던 동안 쌓인 것을 한 번에 맞춘다.
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      };
      source.onerror = async () => {
        source?.close();
        if (stopped) return;
        // EventSource 는 HTTP 상태를 노출하지 않으므로, 재연결 전에 토큰 갱신을 한 번 시도한다.
        if (retry === 0) await refreshTokens().catch(() => undefined);
        const delay = Math.min(30_000, 1_000 * 2 ** retry++);
        retryTimer = window.setTimeout(connect, delay);
      };
    };

    void connect();
    return () => {
      stopped = true;
      source?.close();
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, [queryClient]);
};
