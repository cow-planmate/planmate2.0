import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  fetchUnreadCount,
  readAllNotifications,
  readNotification,
} from './notificationApi';

export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  list: ['notifications', 'list'] as const,
  unread: ['notifications', 'unread'] as const,
};

/**
 * 알림함 첫 페이지. SSE 가 붙어 있으면 이벤트마다 무효화되므로 폴링은 두지 않고,
 * SSE 가 끊긴 채로 방치되는 경우만 대비해 창에 다시 들어올 때 새로 받는다.
 */
export const useNotifications = (enabled = true) =>
  useQuery({
    queryKey: NOTIFICATION_KEYS.list,
    queryFn: () => fetchNotifications(null, 20),
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });

export const useUnreadCount = (enabled = true) =>
  useQuery({
    queryKey: NOTIFICATION_KEYS.unread,
    queryFn: fetchUnreadCount,
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });

export const useReadNotification = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: readNotification,
    onSuccess: () => client.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all }),
  });
};

export const useReadAllNotifications = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: readAllNotifications,
    onSuccess: () => client.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all }),
  });
};
