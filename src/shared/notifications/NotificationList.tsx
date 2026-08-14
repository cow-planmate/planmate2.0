import { Bell } from 'lucide-react';
import type { NotificationItem } from './notificationApi';
import { useNotifications, useReadAllNotifications, useReadNotification } from './queries';
import { viewForNotification, type AppView } from './routes';

interface NotificationListProps {
  /** 알림을 고르면 해당 화면으로 이동한다. 수락/거절은 이동한 도메인 화면에서 한다. */
  onNavigate: (view: AppView) => void;
  onSelected?: () => void;
}

const relativeTime = (iso: string): string => {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

export default function NotificationList({ onNavigate, onSelected }: NotificationListProps) {
  const { data, isLoading, isError } = useNotifications();
  const read = useReadNotification();
  const readAll = useReadAllNotifications();

  const items = data?.items ?? [];
  const hasUnread = items.some((item) => item.readAt === null);

  const select = (notification: NotificationItem) => {
    if (notification.readAt === null) read.mutate(notification.id);
    const view = viewForNotification(notification);
    if (view) {
      onNavigate(view);
      onSelected?.();
    }
  };

  if (isLoading) {
    return <p className="py-6 text-center text-sm text-gray-400">알림을 불러오는 중…</p>;
  }
  if (isError) {
    return <p className="py-6 text-center text-sm text-gray-400">알림을 불러오지 못했습니다.</p>;
  }
  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2 opacity-50" />
        <p className="text-sm text-gray-400">새로운 알림이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {hasUnread && (
        <button
          onClick={() => readAll.mutate()}
          disabled={readAll.isPending}
          className="w-full text-right text-xs font-bold text-[#1344FF] hover:underline disabled:opacity-50"
        >
          모두 읽음
        </button>
      )}
      {items.map((notification) => (
        <button
          key={notification.id}
          onClick={() => select(notification)}
          className={`w-full text-left rounded-xl p-3 border transition-colors ${
            notification.readAt === null
              ? 'bg-blue-50/60 border-blue-100 hover:bg-blue-50'
              : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-bold text-gray-900">{notification.title}</span>
            <span className="shrink-0 text-[11px] text-gray-400">
              {relativeTime(notification.occurredAt)}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">{notification.body}</p>
        </button>
      ))}
    </div>
  );
}
