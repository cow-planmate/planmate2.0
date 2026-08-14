import { getAccessToken, refreshTokens } from '../auth/tokenStore';

// 운영에서는 ingress 가 /api/notifications 를 알림 서버로 라우팅하므로 VITE_API_URL 하나면 된다.
// 로컬은 별도 포트(8083)를 쓰므로 VITE_NOTIFICATION_API_URL 로 덮어쓴다.
const BASE_URL: string =
  import.meta.env.VITE_NOTIFICATION_API_URL || import.meta.env.VITE_API_URL;

export interface NotificationActor {
  userId: string | null;
  displayName: string | null;
}

export interface NotificationResource {
  type: string | null;
  id: string | null;
  displayName: string | null;
}

/** route 는 클라이언트가 소유하는 화면 키다. 서버 내부 URL 은 응답에 담기지 않는다. */
export interface NotificationAction {
  route: string | null;
  parameters: Record<string, string>;
}

export interface NotificationItem {
  id: number;
  type: string;
  category: 'PLAN' | 'SOCIAL' | 'COMMUNITY';
  title: string;
  body: string;
  actor: NotificationActor;
  resource: NotificationResource;
  action: NotificationAction;
  readAt: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface NotificationPage {
  items: NotificationItem[];
  nextCursor: string | null;
}

export type DevicePlatform = 'ANDROID' | 'IOS' | 'WEB';

async function request<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${BASE_URL}/api/notifications${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  // 알림 서버는 미인증을 401 로 내린다 — 그래야 만료된 토큰을 갱신하고 재시도할 수 있다.
  if (response.status === 401 && !retried) {
    await refreshTokens();
    return request<T>(path, init, true);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || '알림을 불러오지 못했습니다.');
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const fetchNotifications = (cursor?: string | null, size = 20) =>
  request<NotificationPage>(
    `?size=${size}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
  );

export const fetchUnreadCount = () => request<{ count: number }>('/unread-count');

export const readNotification = (id: number) =>
  request<void>(`/${id}/read`, { method: 'POST' });

export const readAllNotifications = () => request<void>('/read-all', { method: 'POST' });

export const registerDevice = (installationId: string, token: string, platform: DevicePlatform) =>
  request<void>(`/devices/${encodeURIComponent(installationId)}`, {
    method: 'PUT',
    body: JSON.stringify({ token, platform }),
  });

export const unregisterDevice = (installationId: string) =>
  request<void>(`/devices/${encodeURIComponent(installationId)}`, { method: 'DELETE' });
