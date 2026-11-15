import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { initializeAuth } from '../../../../shared/auth/tokenStore';
import { ErrorToast } from '../../../common/Toast';
import {
  acceptFriendRequest,
  fetchChatRooms,
  fetchSentFriendRequests,
  readFriendRequestAlarm,
  fetchFriends,
  fetchMessages,
  fetchReceivedFriendRequests,
  openSocialEvents,
  rejectFriendRequest,
  removeFriend,
  searchUsers,
  sendFriendRequest,
  sendMessage,
  type ChatMessage,
} from '../api/socialApi';

const KEYS = {
  friends: ['social', 'friends'] as const,
  requests: ['social', 'friend-requests'] as const,
  rooms: ['social', 'rooms'] as const,
  messages: (roomId: number) => ['social', 'messages', roomId] as const,
  search: (q: string) => ['social', 'search', q] as const,
};

// ── 조회 ─────────────────────────────────────────────────────────────────
export const useFriends = (enabled = true) =>
  useQuery({ queryKey: KEYS.friends, queryFn: fetchFriends, enabled });

export const useFriendRequests = (enabled = true) =>
  useQuery({ queryKey: KEYS.requests, queryFn: fetchReceivedFriendRequests, enabled });

export const useChatRooms = (enabled = true) =>
  useQuery({ queryKey: KEYS.rooms, queryFn: fetchChatRooms, enabled });

export const useSentFriendRequests = (enabled = true) => useQuery({ queryKey: ['social', 'sent-requests'], queryFn: fetchSentFriendRequests, enabled });

export const useUserSearch = (q: string) =>
  useQuery({ queryKey: KEYS.search(q), queryFn: () => searchUsers(q), enabled: q.trim().length > 0 });

export const useMessages = (roomId: number | undefined) =>
  useQuery({ queryKey: KEYS.messages(roomId ?? 0), queryFn: () => fetchMessages(roomId!), enabled: roomId != null });

// ── 변경 ─────────────────────────────────────────────────────────────────
export const useSendFriendRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendFriendRequest,
    // 상대가 먼저 보낸 요청이 있으면 서버가 바로 수락 처리하므로 친구 목록도 다시 받는다
    onSuccess: async (result) => {
      if (result.status === 'ACCEPTED') await readFriendRequestAlarm(result.id).catch(() => ErrorToast('친구가 되었지만 알람 읽음 저장에 실패했습니다.'));
      await Promise.all([qc.invalidateQueries({ queryKey: ['social'] }), qc.invalidateQueries({ queryKey: ['notification-center'] })]);
    },
  });
};

export const useRespondFriendRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accept }: { id: number; accept: boolean }) =>
      accept ? acceptFriendRequest(id) : rejectFriendRequest(id),
    onSuccess: async (_, { id }) => {
      await readFriendRequestAlarm(id).catch(() => ErrorToast('요청은 처리됐지만 알람 읽음 저장에 실패했습니다.'));
      qc.invalidateQueries({ queryKey: ['notification-center'] });
      qc.invalidateQueries({ queryKey: KEYS.requests });
      qc.invalidateQueries({ queryKey: KEYS.friends });
    },
  });
};

export const useRemoveFriend = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeFriend,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.friends }),
  });
};

export const useSendMessage = (roomId: number | undefined) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendMessage(roomId!, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.messages(roomId ?? 0) });
      qc.invalidateQueries({ queryKey: KEYS.rooms });
    },
  });
};

/** Reconnect with a fresh token and reload missed events after every connection. */
export const useSocialEvents = (enabled: boolean) => {
  const qc = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let events: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout>;
    const refresh = () => {
      void qc.invalidateQueries({ queryKey: ['social'] });
      void qc.invalidateQueries({ queryKey: ['notification-center'] });
    };
    const connect = async () => {
      await initializeAuth();
      if (stopped) return;
      events = openSocialEvents();
      if (!events) return;
      events.addEventListener('connected', refresh);
      const onMessage = (e: MessageEvent) => {
        try {
          const message = JSON.parse(e.data) as ChatMessage;
          if (message.roomId == null) return;
          void qc.invalidateQueries({ queryKey: KEYS.messages(message.roomId) });
          void qc.invalidateQueries({ queryKey: KEYS.rooms });
        } catch { refresh(); }
      };
      events.addEventListener('chat-message', onMessage);
      events.addEventListener('chat-message-deleted', onMessage);
      events.addEventListener('notification', refresh);
      events.onerror = () => {
        events?.close();
        if (!stopped) retry = setTimeout(() => { void connect(); }, 3000);
      };
    };
    const resume = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', resume);
    void connect();
    return () => { stopped = true; clearTimeout(retry); events?.close(); document.removeEventListener('visibilitychange', resume); };
  }, [enabled, qc]);
};
