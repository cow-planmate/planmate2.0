import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  acceptFriendRequest,
  fetchChatRooms,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social'] }),
  });
};

export const useRespondFriendRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accept }: { id: number; accept: boolean }) =>
      accept ? acceptFriendRequest(id) : rejectFriendRequest(id),
    onSuccess: () => {
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

/** Social SSE를 열어 새 메시지·친구 요청이 오면 해당 목록을 다시 받는다 */
export const useSocialEvents = (enabled: boolean) => {
  const qc = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    const events = openSocialEvents();
    if (!events) return;
    const onMessage = (e: MessageEvent) => {
      const message = JSON.parse(e.data) as ChatMessage;
      qc.invalidateQueries({ queryKey: KEYS.messages(message.roomId) });
      qc.invalidateQueries({ queryKey: KEYS.rooms });
    };
    const onNotification = () => {
      qc.invalidateQueries({ queryKey: KEYS.requests });
      qc.invalidateQueries({ queryKey: KEYS.friends });
    };
    events.addEventListener('chat-message', onMessage);
    events.addEventListener('chat-message-deleted', onMessage);
    events.addEventListener('notification', onNotification);
    return () => events.close();
  }, [enabled, qc]);
};
