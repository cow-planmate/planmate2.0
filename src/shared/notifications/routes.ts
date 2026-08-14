import type { NotificationItem } from './notificationApi';

export type AppView =
  | 'feed'
  | 'community'
  | 'create'
  | 'mypage'
  | 'plan-maker'
  | 'social';

/**
 * 서버가 준 route 키를 이 앱의 화면으로 옮긴다. route 는 클라이언트가 소유하는 값이라
 * 서버는 어떤 화면이 어떤 경로인지 알지 못한다 — 매핑은 여기 한 곳에만 둔다.
 *
 * 모르는 route 는 null 을 돌려주고 화면 이동 없이 읽음 처리만 한다. 새 알림 유형이 서버에
 * 먼저 배포돼도 구버전 웹이 깨지지 않아야 하기 때문이다.
 */
export const viewForNotification = (notification: NotificationItem): AppView | null => {
  switch (notification.action.route) {
    case 'COLLABORATION_REQUESTS':
    case 'PLAN_DETAIL':
      return 'feed';
    case 'SOCIAL_FRIEND_REQUESTS':
      return 'social';
    case 'COMMUNITY_POST':
    case 'COMMUNITY_BADGES':
      return 'community';
    default:
      return null;
  }
};
