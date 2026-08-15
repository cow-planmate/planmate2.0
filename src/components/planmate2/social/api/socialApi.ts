import { getAccessToken, refreshTokens } from '../../../../shared/auth/tokenStore';

const BASE_URL: string = import.meta.env.VITE_SOCIAL_API_URL || import.meta.env.VITE_API_URL;
export interface PageResponse<T> { items: T[]; page: number; size: number; totalElements: number; totalPages: number }
export interface SocialUser { userId: string; nickname: string; profileImageUrl?: string | null; avatarHash?: string | null; deleted: boolean }
export interface ChatRoom { roomId: number; partner: SocialUser; lastMessage?: string | null; lastMessageAt?: string | null; unreadCount: number }
export interface ChatMessage { id: number; roomId: number; senderId: string; content: string | null; createdAt: string; deleted: boolean }

async function request<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${BASE_URL}/api/social${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers } });
  if (response.status === 401 && !retried) { await refreshTokens(); return request<T>(path, init, true); }
  if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(body?.message || '요청 처리에 실패했습니다.'); }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const fetchFriends = (q = '') => request<PageResponse<SocialUser>>(`/friends?page=0&size=50${q ? `&q=${encodeURIComponent(q)}` : ''}`);
export const searchUsers = (q: string) => request<PageResponse<SocialUser>>(`/users/search?q=${encodeURIComponent(q)}&page=0&size=20`);
export const createFriendRequest = (addresseeId: string) => request('/friend-requests', { method: 'POST', body: JSON.stringify({ addresseeId }) });
export const fetchChatRooms = () => request<PageResponse<ChatRoom>>('/chat/rooms?page=0&size=50');
export const createChatRoom = (targetUserId: string) => request<ChatRoom>('/chat/rooms', { method: 'POST', body: JSON.stringify({ targetUserId }) });
export const fetchChatMessages = (roomId: number) => request<{ messages: ChatMessage[]; hasMore: boolean }>(`/chat/rooms/${roomId}/messages`);
export const sendChatMessage = (roomId: number, content: string) => request<ChatMessage>(`/chat/rooms/${roomId}/messages`, { method: 'POST', body: JSON.stringify({ content }) });
export type MessageDeleteScope = 'ME' | 'EVERYONE';
export const deleteChatMessage = (roomId: number, messageId: number, scope: MessageDeleteScope) => request<void>(`/chat/rooms/${roomId}/messages/${messageId}?scope=${scope}`, { method: 'DELETE' });
export const readChatRoom = (roomId: number, lastReadMessageId: number) => request<void>(`/chat/rooms/${roomId}/read`, { method: 'POST', body: JSON.stringify({ lastReadMessageId }) });
export const isUserBlocked = (userId: string) => request<{ blocked: boolean }>(`/blocks/${userId}`);
export const blockUser = (userId: string) => request<void>(`/blocks/${userId}`, { method: 'POST' });
export const unblockUser = (userId: string) => request<void>(`/blocks/${userId}`, { method: 'DELETE' });
