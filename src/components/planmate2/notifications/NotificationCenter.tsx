import { Bell, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useApiClient } from '../../../hooks/useApiClient';
import { getAccessToken, getAuthenticatedUserId, initializeAuth } from '../../../shared/auth/tokenStore';
import { fetchPost } from '../community/api/communityApi';
import { ErrorToast, SuccessToast } from '../../common/Toast';

interface Notification {
  id: number;
  title: string;
  body: string;
  type: string;
  readAt: string | null;
  createdAt: string;
  action: { route: string; parameters: Record<string, string> };
}
interface Invitation {
  collaborationRequestId: number;
  senderNickname: string;
  planName: string;
  type?: 'INVITE' | 'REQUEST';
}
interface Page { items: Notification[]; nextCursor: string | null }
const BASE_URL = import.meta.env.VITE_API_URL;

export default function NotificationCenter({ onInvitationAccept, onOpen }: {
  onInvitationAccept?: () => void | Promise<void>;
  onOpen: () => void;
}) {
  const { apiRequest, post } = useApiClient();
  const navigate = useNavigate();
  const client = useQueryClient();
  const userId = getAuthenticatedUserId();
  const key = ['notification-center', userId];
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = () => { setOpen(false); bellRef.current?.focus(); };
  const notifications = useInfiniteQuery({
    queryKey: [...key, 'list'],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }): Promise<Page> => apiRequest(
      `${BASE_URL}/api/notifications?size=20${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ''}`, { signal }),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    refetchInterval: 60_000,
  });
  const unread = useQuery({
    queryKey: [...key, 'unread'],
    queryFn: ({ signal }): Promise<{ count: number }> => apiRequest(`${BASE_URL}/api/notifications/unread-count`, { signal }),
    refetchInterval: 60_000,
  });
  const pending = useQuery({
    queryKey: [...key, 'pending'],
    queryFn: async ({ signal }): Promise<Invitation[]> => {
      const response = await apiRequest(`${BASE_URL}/api/collaboration-requests/pending`, { signal });
      return (response.requests || []).map((item: Invitation & { requestId?: number; id?: number }) => ({
        ...item, collaborationRequestId: item.collaborationRequestId ?? item.requestId ?? item.id,
      })).filter((item: Invitation) => item.collaborationRequestId != null);
    },
    refetchInterval: 60_000,
  });
  useEffect(() => {
    let stopped = false;
    let source: EventSource | null = null;
    let timer: ReturnType<typeof setTimeout>;
    let lastEventId = '';
    const refresh = () => { void client.invalidateQueries({ queryKey: ['notification-center', userId] }); };
    const connect = async () => {
      await initializeAuth();
      if (stopped) return;
      const token = getAccessToken();
      if (!token) return;
      source = new EventSource(`${BASE_URL}/api/notifications/sse/subscribe?token=${encodeURIComponent(token)}${lastEventId ? `&lastEventId=${encodeURIComponent(lastEventId)}` : ''}`);
      source.addEventListener('connect', refresh);
      source.addEventListener('notification', (event: MessageEvent) => {
        if (event.lastEventId && event.lastEventId === lastEventId) return;
        lastEventId = event.lastEventId || lastEventId;
        setToast(true);
        refresh();
      });
      source.onerror = () => {
        source?.close();
        if (!stopped) timer = setTimeout(() => { void connect(); }, 5000);
      };
    };
    void connect();
    return () => { stopped = true; source?.close(); clearTimeout(timer); };
  }, [client, userId]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(false), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); bellRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  const refresh = () => client.invalidateQueries({ queryKey: key });
  const toggle = () => {
    setToast(false);
    setOpen(!open);
    if (!open) { onOpen(); void refresh(); }
  };
  const run = async (action: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try { await action(); }
    catch (error) { ErrorToast(error instanceof Error ? error.message : '알람 처리에 실패했습니다.'); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const items = [...new Map((notifications.data?.pages.flatMap(page => page.items) ?? []).map(item => [item.id, item])).values()];
  const invitations = pending.data ?? [];
  const isRequest = (item: Notification) => item.type.endsWith('PLAN_INVITED') || item.type.endsWith('PLAN_EDIT_ACCESS_REQUESTED');
  const history = items.filter(item => !isRequest(item) || !invitations.some(invitation =>
    String(invitation.collaborationRequestId) === item.action?.parameters?.collaborationRequestId));
  const respond = (invitation: Invitation, accepted: boolean) => run(async () => {
    await post(`${BASE_URL}/api/collaboration-requests/${invitation.collaborationRequestId}/${accepted ? 'accept' : 'reject'}`);
    SuccessToast(`요청을 ${accepted ? '수락' : '거절'}했습니다.`);
    // 협업 처리 성공과 알람 읽음 처리는 별개다. 읽음 실패 시에도 처리된 요청은 갱신한다.
    try {
      const matching = items.filter(item => isRequest(item) && String(invitation.collaborationRequestId) === item.action?.parameters?.collaborationRequestId);
      await Promise.all(matching.filter(item => !item.readAt).map(item => post(`${BASE_URL}/api/notifications/${item.id}/read`)));
    } finally {
      await refresh();
      if (accepted) await onInvitationAccept?.();
    }
  });
  const openItem = (item: Notification) => run(async () => {
    if (!item.readAt) {
      await post(`${BASE_URL}/api/notifications/${item.id}/read`);
      await refresh();
    }
    const params = item.action?.parameters ?? {};
    let path: string | null = null;
    switch (item.action?.route) {
      case 'PLAN_DETAIL':
        // 거절된 요청은 일정 접근 권한이 없을 수 있다.
        path = item.type.endsWith('PLAN_REQUEST_REJECTED') ? '/mypage?section=trips'
          : params.planId ? `/create?id=${encodeURIComponent(params.planId)}` : '/mypage?section=trips';
        break;
      case 'SOCIAL_FRIEND_REQUESTS': case 'SOCIAL_CHAT_ROOM': case 'CHAT_ROOM': path = '/social'; break;
      case 'FEED_POST': if (params.feedId) path = `/travel/${encodeURIComponent(params.feedId)}`; break;
      case 'COMMUNITY_POST':
        if (params.postId) {
          const post = await fetchPost(params.postId);
          path = `/community/${encodeURIComponent(post.category)}/${encodeURIComponent(params.postId)}`;
        }
        break;
      case 'COMMUNITY_BADGES': path = '/mypage?section=community'; break;
    }
    if (path) { close(); navigate(path); }
  });
  const hasBadge = (unread.data?.count ?? 0) > 0 || invitations.length > 0;
  return (
    <div ref={rootRef} className="ml-auto md:ml-0">
      <button ref={bellRef} type="button" aria-label="알람 보기" aria-expanded={open} aria-controls="notification-center"
        onClick={toggle} className={`relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-gray-50 ${open ? 'text-[#1344FF] bg-gray-100' : 'text-gray-600'}`}>
        <Bell className="h-5 w-5 md:h-6 md:w-6" />
        {hasBadge && <span aria-label="확인할 알람 있음" className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />}
      </button>
      {toast && !open && <button type="button" role="status" onClick={toggle}
        className="absolute right-4 top-[70px] z-30 rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm shadow-lg">새로운 알람이 도착했어요</button>}
      {open && <div ref={panelRef} tabIndex={-1} id="notification-center" role="dialog" aria-label="알람"
        className="absolute right-3 top-[70px] z-30 w-[calc(100%-1.5rem)] max-w-sm rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl focus:outline-none">
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-900">알람</h3>
          <div className="flex items-center gap-3">
            <button type="button" disabled={busy || !(unread.data?.count)} className="text-xs text-[#1344FF] disabled:text-gray-400"
              onClick={() => void run(async () => { await post(`${BASE_URL}/api/notifications/read-all`); await refresh(); })}>모두 읽음</button>
            <button type="button" aria-label="알람 닫기" onClick={close} className="p-1 text-gray-500"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="max-h-[min(28rem,70dvh)] space-y-3 overflow-y-auto" aria-busy={notifications.isPending || pending.isPending}>
          {(notifications.isError || pending.isError || unread.isError) && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {notifications.isError ? '알람 목록' : pending.isError ? '초대·권한 요청 목록' : '읽지 않은 알람 수'}을 불러오지 못했습니다.
            <button type="button" className="ml-2 underline" onClick={() => void refresh()}>다시 시도</button>
          </div>}
          {invitations.map(invitation => <div key={invitation.collaborationRequestId} className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
            <p className="mb-3 text-sm leading-relaxed text-gray-700"><strong>{invitation.senderNickname}</strong>님이 <strong>'{invitation.planName}'</strong> {invitation.type === 'REQUEST' ? '일정의 편집 권한을 요청했습니다.' : '일정 편집 초대를 보냈습니다.'}</p>
            <div className="flex gap-2">
              <button type="button" disabled={busy} onClick={() => void respond(invitation, true)} className="flex-1 rounded-lg bg-[#1344FF] py-2 text-xs font-bold text-white disabled:opacity-50">수락</button>
              <button type="button" disabled={busy} onClick={() => void respond(invitation, false)} className="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-xs font-bold text-gray-600 disabled:opacity-50">거절</button>
            </div>
          </div>)}
          {history.map(item => <button type="button" key={item.id} disabled={busy} onClick={() => void openItem(item)}
            className={`block w-full rounded-xl border p-3 text-left disabled:opacity-50 ${item.readAt ? 'border-gray-100 bg-gray-50' : 'border-blue-100 bg-blue-50/50'}`}>
            <span className="flex items-center gap-2 text-sm font-bold text-gray-900">{!item.readAt && <span aria-label="읽지 않음" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1344FF]" />}{item.title}</span>
            <span className="mt-1 block text-sm leading-relaxed text-gray-600">{item.body}</span>
            <time dateTime={item.createdAt} className="mt-2 block text-xs text-gray-400">{new Date(item.createdAt).toLocaleString('ko-KR')}</time>
          </button>)}
          {(notifications.isPending || pending.isPending) && <p className="py-6 text-center text-sm text-gray-400">알람을 불러오는 중입니다.</p>}
          {!notifications.isPending && !pending.isPending && !notifications.isError && !pending.isError && !items.length && !invitations.length && <p className="py-8 text-center text-sm text-gray-400">새로운 알람이 없습니다.</p>}
          {notifications.hasNextPage && <button type="button" disabled={notifications.isFetchingNextPage} onClick={() => void notifications.fetchNextPage()} className="w-full rounded-lg py-2 text-sm text-[#1344FF] disabled:opacity-50">{notifications.isFetchingNextPage ? '불러오는 중…' : '이전 알람 더 보기'}</button>}
        </div>
      </div>}
    </div>
  );
}
