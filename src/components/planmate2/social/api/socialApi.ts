import { getAccessToken, getRefreshToken, refreshTokens } from '../../../../shared/auth/tokenStore';

/**
 * Social 마이크로서비스(친구·1:1 채팅) API 클라이언트.
 * Gateway가 /api/social/** 를 Social 로 넘기므로 메인 API와 같은 도메인을 쓴다.
 * 인증/토큰 갱신 방식은 다른 API 클라이언트와 동일하게 tokenStore를 공유한다.
 */
const BASE_URL: string = import.meta.env.VITE_API_URL;

// ── 응답 타입 (Social DTO와 1:1) ─────────────────────────────────────────

export interface SocialUser {
  userId: string;
  nickname: string;
  profileImageUrl: string | null;
  avatarHash: string | null;
  deleted: boolean;
}

export interface FriendRequestItem {
  id: number;
  requester: SocialUser;
  createdAt: string;
}

export interface ChatRoom {
  roomId: number;
  partner: SocialUser;
  /** 메시지가 없거나 마지막 메시지가 삭제됐으면 null (lastMessageAt으로 구분) */
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: string;
  content: string | null;
  createdAt: string;
  deleted: boolean;
}

interface Items<T> {
  items: T[];
  totalElements: number;
}

const request = async <T>(path: string, options: RequestInit = {}, retried = false): Promise<T> => {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && !retried && getRefreshToken()) {
    await refreshTokens();
    return request<T>(path, options, true);
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw Object.assign(new Error(errorBody?.message || `요청 실패: ${res.status}`), { code: errorBody?.code });
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
};

// ── 친구 ─────────────────────────────────────────────────────────────────
export const fetchFriends = () => request<Items<SocialUser>>('/api/social/friends');

export const searchUsers = (q: string) =>
  request<Items<SocialUser>>(`/api/social/users/search?q=${encodeURIComponent(q)}`);

export const fetchReceivedFriendRequests = () => request<Items<FriendRequestItem>>('/api/social/friend-requests');

export const sendFriendRequest = (addresseeId: string) =>
  // 상대가 먼저 보낸 요청이 있으면 서버가 바로 수락하고 status ACCEPTED 를 돌려준다
  request<{ status: string }>('/api/social/friend-requests', { method: 'POST', body: JSON.stringify({ addresseeId }) });

export const acceptFriendRequest = (id: number) =>
  request(`/api/social/friend-requests/${id}/accept`, { method: 'POST' });

export const rejectFriendRequest = (id: number) =>
  request(`/api/social/friend-requests/${id}/reject`, { method: 'POST' });

export const removeFriend = (userId: string) => request<void>(`/api/social/friends/${userId}`, { method: 'DELETE' });

// ── 채팅 ─────────────────────────────────────────────────────────────────
export const fetchChatRooms = () => request<Items<ChatRoom>>('/api/social/chat/rooms?size=50');

/** 같은 상대와의 방이 이미 있으면 서버가 그 방을 돌려준다 */
export const openChatRoom = (targetUserId: string) =>
  request<ChatRoom>('/api/social/chat/rooms', { method: 'POST', body: JSON.stringify({ targetUserId }) });

export const fetchMessages = (roomId: number) =>
  request<{ messages: ChatMessage[]; hasMore: boolean }>(`/api/social/chat/rooms/${roomId}/messages?size=100`);

export const sendMessage = (roomId: number, content: string) =>
  request<ChatMessage>(`/api/social/chat/rooms/${roomId}/messages`, { method: 'POST', body: JSON.stringify({ content }) });

export const markRoomRead = (roomId: number, lastReadMessageId: number) =>
  request<void>(`/api/social/chat/rooms/${roomId}/read`, { method: 'POST', body: JSON.stringify({ lastReadMessageId }) });

/** 새 메시지 수신용 SSE — Gateway가 SSE 경로에 한해 ?token= 을 인증으로 받는다 */
export const openSocialEvents = () => {
  const token = getAccessToken();
  return token ? new EventSource(`${BASE_URL}/api/social/sse/subscribe?token=${encodeURIComponent(token)}`) : null;
};
