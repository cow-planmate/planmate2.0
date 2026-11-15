import { fetchFriendRequestStatuses, readFriendRequestAlarm, type FriendRequestItem } from '../social/api/socialApi';
import { useFriendRequests, useRespondFriendRequest } from '../social/hooks/queries';
import { Bell, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
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
  planId: string;
}
interface RequestState { collaborationRequestId: number; status: 'PENDING' | 'ACCEPTED' | 'REJECTED'; type: 'INVITE' | 'REQUEST'; planId: string }
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
  const [tab, setTab] = useState<'alarms' | 'requests'>('alarms');
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const busyRef = useRef(new Set<string>());
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
  const friendRequests = useFriendRequests();
  const friendRespond = useRespondFriendRequest();
  const friends = friendRequests.data?.items ?? [];
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
  const items = [...new Map((notifications.data?.pages.flatMap(page => page.items) ?? []).map(item => [item.id, item])).values()];
  const invitations = pending.data ?? [];
  const requestIds = [...new Set(items.map(item => item.action?.parameters?.collaborationRequestId)
    .filter((id): id is string => !!id && /^\d+$/.test(id)))].sort();
  const statuses = useQuery({
    queryKey: [...key, 'statuses', requestIds],
    enabled: requestIds.length > 0,
    queryFn: async ({ signal }): Promise<RequestState[]> => {
      const batches = [];
      for (let i = 0; i < requestIds.length; i += 100) {
        batches.push(apiRequest(`${BASE_URL}/api/collaboration-requests/statuses?ids=${requestIds.slice(i, i + 100).join(',')}`, { signal }));
      }
      return (await Promise.all(batches)).flat();
    },
    refetchInterval: 60_000,
  });
  const friendIds = [...new Set(items.filter(item => item.type.endsWith('FRIEND_REQUESTED'))
    .map(item => item.action?.parameters?.friendRequestId).filter((id): id is string => !!id && /^\d+$/.test(id)))].sort();
  const friendStates = useQuery({
    queryKey: [...key, 'friend-statuses', friendIds], enabled: friendIds.length > 0,
    queryFn: async () => {
      const batches = [];
      for (let i = 0; i < friendIds.length; i += 100) batches.push(fetchFriendRequestStatuses(friendIds.slice(i, i + 100)));
      return (await Promise.all(batches)).flat();
    }, refetchInterval: 60_000,
  });
  const requestCount = invitations.length + friends.length;
  const stateFor = (item: Notification): RequestState | undefined => {
    const id = item.action?.parameters?.collaborationRequestId;
    const waiting = invitations.find(invitation => String(invitation.collaborationRequestId) === id);
    if (waiting) return { ...waiting, status: 'PENDING', type: waiting.type ?? 'INVITE' };
    return statuses.data?.find(state => String(state.collaborationRequestId) === id);
  };
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
  const refresh = () => Promise.all([client.invalidateQueries({ queryKey: key }), client.invalidateQueries({ queryKey: ['social', 'friend-requests'] })]);
  const toggle = () => {
    setToast(false);
    setOpen(!open);
    if (!open) { onOpen(); void refresh(); }
  };
  const run = async (id: string, action: () => Promise<void>) => {
    if (busyRef.current.has(id)) return;
    busyRef.current.add(id);
    setBusyIds(new Set(busyRef.current));
    try { await action(); }
    catch (error) { ErrorToast(error instanceof Error ? error.message : '알람 처리에 실패했습니다.'); }
    finally { busyRef.current.delete(id); setBusyIds(new Set(busyRef.current)); }
  };
  const isRequest = (item: Notification) => item.type.endsWith('PLAN_INVITED') || item.type.endsWith('PLAN_EDIT_ACCESS_REQUESTED');
  const updateItems = (update: (items: Notification[]) => Notification[]) => {
    client.setQueryData<InfiniteData<Page>>([...key, 'list'], old => old && ({
      ...old, pages: old.pages.map(page => ({ ...page, items: update(page.items) })),
    }));
  };
  const markRead = async (item: Notification) => {
    if (item.readAt || busyRef.current.has(`read:${item.id}`)) return;
    busyRef.current.add(`read:${item.id}`);
    try {
      await post(`${BASE_URL}/api/notifications/${item.id}/read`);
      await client.cancelQueries({ queryKey: [...key, 'list'] });
      updateItems(items => items.map(current => current.id === item.id ? { ...current, readAt: new Date().toISOString() } : current));
      void client.invalidateQueries({ queryKey: [...key, 'unread'] });
    } finally { busyRef.current.delete(`read:${item.id}`); }
  };
  const processedFriendIds = (friendStates.data ?? []).filter(state => state.status !== 'PENDING'
    && items.some(item => !item.readAt && item.type.endsWith('FRIEND_REQUESTED') && item.action?.parameters?.friendRequestId === String(state.id))).map(state => state.id);
  useEffect(() => {
    if (!processedFriendIds.length) return;
    let cancelled = false;
    void Promise.all(processedFriendIds.map(readFriendRequestAlarm)).then(() => {
      if (!cancelled) void refresh();
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [processedFriendIds.join(','), friendStates.dataUpdatedAt, client, userId]);
  const dismiss = (item: Notification) => run(`alarm:${item.id}`, async () => {
    await client.cancelQueries({ queryKey: [...key, 'list'] });
    updateItems(items => items.filter(current => current.id !== item.id));
    if (!item.readAt) {
      await client.cancelQueries({ queryKey: [...key, 'unread'] });
      client.setQueryData<{ count: number }>([...key, 'unread'], old => old ? { count: Math.max(0, old.count - 1) } : old);
    }
    try {
      await apiRequest(`${BASE_URL}/api/notifications/${item.id}`, { method: 'DELETE' });
      void client.invalidateQueries({ queryKey: [...key, 'unread'] });
      if (stateFor(item)?.status === 'PENDING') SuccessToast('알람을 삭제했습니다. 요청은 ‘응답할 요청’에 남아 있습니다.');
    } catch (error) {
      void client.invalidateQueries({ queryKey: [...key, 'list'] });
      void client.invalidateQueries({ queryKey: [...key, 'unread'] });
      throw error;
    }
  });
  const respond = (invitation: Invitation, accepted: boolean) => run(`request:${invitation.collaborationRequestId}`, async () => {
    try {
      await post(`${BASE_URL}/api/collaboration-requests/${invitation.collaborationRequestId}/${accepted ? 'accept' : 'reject'}`);
    } catch (error) {
      void refresh(); // 다른 기기에서 이미 응답했을 수 있다.
      throw error;
    }
    await client.cancelQueries({ queryKey: [...key, 'pending'] });
    client.setQueryData<Invitation[]>([...key, 'pending'], old => old?.filter(item => item.collaborationRequestId !== invitation.collaborationRequestId));
    await client.cancelQueries({ queryKey: [...key, 'statuses'] });
    client.setQueriesData<RequestState[]>({ queryKey: [...key, 'statuses'] }, old => {
      const next = { collaborationRequestId: invitation.collaborationRequestId, status: accepted ? 'ACCEPTED' as const : 'REJECTED' as const, type: invitation.type ?? 'INVITE' as const, planId: invitation.planId };
      return [...(old ?? []).filter(item => item.collaborationRequestId !== next.collaborationRequestId), next];
    });
    SuccessToast(`요청을 ${accepted ? '수락' : '거절'}했습니다.`);
    const matching = items.filter(item => isRequest(item) && String(invitation.collaborationRequestId) === item.action?.parameters?.collaborationRequestId);
    void Promise.all(matching.map(markRead)).catch(() => ErrorToast('요청은 처리됐지만 알람 읽음 표시에 실패했습니다.'));
    void refresh();
    if (accepted) await onInvitationAccept?.();
  });
  const openItem = (item: Notification) => run(`alarm:${item.id}`, async () => {
    // 읽음 저장 장애가 콘텐츠 열기를 막지 않게 별도로 처리한다.
    void markRead(item).catch(() => ErrorToast('알람 읽음 표시에 실패했습니다. 다시 눌러 재시도할 수 있습니다.'));
    const params = item.action?.parameters ?? {};
    let path: string | null = null;
    switch (item.action?.route) {
      case 'COLLABORATION_REQUESTS': {
        const state = stateFor(item);
        if (!state) {
          ErrorToast(statuses.isError ? '요청 상태를 확인하지 못했습니다. 다시 시도해 주세요.' : statuses.isFetching ? '요청 상태를 확인 중입니다. 잠시 후 다시 눌러 주세요.' : '종료되었거나 더 이상 확인할 수 없는 요청입니다.');
          return;
        }
        if (state.status === 'PENDING') { setTab('requests'); return; }
        path = state.status === 'REJECTED' && state.type === 'INVITE' ? '/mypage?section=trips' : `/create?id=${encodeURIComponent(state.planId)}`;
        break;
      }
      case 'PLAN_DETAIL':
        path = item.type.endsWith('PLAN_REQUEST_REJECTED') ? '/mypage?section=trips'
          : params.planId ? `/create?id=${encodeURIComponent(params.planId)}` : '/mypage?section=trips';
        break;
      case 'SOCIAL_FRIEND_REQUESTS': path = '/social'; break;
      case 'SOCIAL_CHAT_ROOM': case 'CHAT_ROOM': path = params.roomId ? `/social?roomId=${encodeURIComponent(params.roomId)}` : '/social'; break;
      case 'FEED_POST': if (params.feedId) path = `/travel/${encodeURIComponent(params.feedId)}`; break;
      case 'COMMUNITY_POST':
        if (params.postId) {
          try {
            const post = await fetchPost(params.postId);
            path = `/community/${encodeURIComponent(post.category)}/${encodeURIComponent(params.postId)}`;
          } catch { ErrorToast('삭제되었거나 접근할 수 없는 게시글입니다.'); return; }
        }
        break;
      case 'COMMUNITY_BADGES': path = '/mypage?section=community'; break;
    }
    if (path) { if (params.commentId && /^\d+$/.test(params.commentId)) path += `#comment-${params.commentId}`; close(); navigate(path); }
    else ErrorToast('연결된 화면을 열 수 없는 알람입니다.');
  });
  const readAll = () => run('read-all', async () => {
    await post(`${BASE_URL}/api/notifications/read-all`);
    await client.cancelQueries({ queryKey: key });
    updateItems(items => items.map(item => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
    client.setQueryData([...key, 'unread'], { count: 0 });
    void refresh();
  });
  const statusLabel = (item: Notification) => {
    if (item.type.endsWith('FRIEND_REQUESTED')) {
      const state = friendStates.data?.find(state => String(state.id) === item.action?.parameters?.friendRequestId);
      return state ? { PENDING: '응답 대기', ACCEPTED: '수락 완료', REJECTED: '거절됨', CANCELED: '취소됨' }[state.status] : null;
    }
    if (!isRequest(item)) return null;
    const state = stateFor(item);
    if (state) return { PENDING: '응답 대기', ACCEPTED: '수락 완료', REJECTED: '거절됨' }[state.status];
    return statuses.isError ? '상태 확인 실패' : statuses.isPending ? '상태 확인 중' : '확인할 수 없는 요청';
  };
  const friendActions = (request: FriendRequestItem) => {
    const busy = busyIds.has(`friend:${request.id}`);
    return <div className="mt-3 flex gap-2" aria-busy={busy}>
      {[true, false].map(accept => <button key={String(accept)} type="button" disabled={busy}
        className="flex-1 rounded-lg border bg-white py-2 text-xs font-bold text-blue-600 disabled:opacity-50"
        onClick={() => void run(`friend:${request.id}`, async () => {
          await friendRespond.mutateAsync({ id: request.id, accept });
          SuccessToast(`친구 요청을 ${accept ? '수락' : '거절'}했습니다.`);
          void refresh();
        })}>{busy ? '처리 중…' : accept ? '수락' : '거절'}</button>)}
    </div>;
  };
  const requestActions = (invitation: Invitation) => {
    const busy = busyIds.has(`request:${invitation.collaborationRequestId}`);
    return <div className="mt-3 flex gap-2" aria-busy={busy}>
      <button type="button" disabled={busy} onClick={() => void respond(invitation, true)} className="flex-1 rounded-lg bg-[#1344FF] py-2 text-xs font-bold text-white disabled:opacity-50">{busy ? '처리 중…' : '수락'}</button>
      <button type="button" disabled={busy} onClick={() => void respond(invitation, false)} className="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-xs font-bold text-gray-600 disabled:opacity-50">거절</button>
    </div>;
  };
  return (
    <div ref={rootRef} className="ml-auto md:ml-0">
      <button ref={bellRef} type="button" aria-label={`알람 보기${(unread.data?.count ?? 0) > 0 ? `, 읽지 않은 알람 ${unread.data?.count}개` : ''}${requestCount ? `, 응답할 요청 ${requestCount}개` : ''}`} aria-expanded={open} aria-controls="notification-center"
        onClick={toggle} className={`relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-gray-50 ${open ? 'text-[#1344FF] bg-gray-100' : 'text-gray-600'}`}>
        <Bell className="h-5 w-5 md:h-6 md:w-6" />
        {(unread.data?.count ?? 0) > 0 && <span aria-label="읽지 않은 알람 있음" className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />}
        {requestCount > 0 && <span aria-label={`응답할 요청 ${requestCount}개`} className="absolute -bottom-0.5 -right-0.5 min-w-4 rounded-full bg-amber-100 px-1 text-[10px] font-bold text-amber-800">{requestCount}</span>}
      </button>
      {toast && !open && <button type="button" role="status" onClick={toggle}
        className="absolute right-4 top-[70px] z-30 rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm shadow-lg">새로운 알람이 도착했어요</button>}
      {open && <div ref={panelRef} tabIndex={-1} id="notification-center" role="dialog" aria-label="알람"
        className="absolute right-3 top-[70px] z-30 w-[calc(100%-1.5rem)] max-w-sm rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl focus:outline-none">
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-900">알람</h3>
          <div className="flex items-center gap-3">
            <button type="button" disabled={busyIds.has('read-all') || !(unread.data?.count)} className="text-xs text-[#1344FF] disabled:text-gray-400"
              onClick={() => void readAll()}>{busyIds.has('read-all') ? '처리 중…' : '모두 읽음'}</button>
            <button type="button" aria-label="알람 닫기" onClick={close} className="p-1 text-gray-500"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="mb-3 flex gap-2" role="group" aria-label="알람 목록 선택">
          <button type="button" aria-pressed={tab === 'alarms'} onClick={() => setTab('alarms')} className={`rounded-lg px-3 py-2 text-xs font-bold ${tab === 'alarms' ? 'bg-blue-50 text-[#1344FF]' : 'text-gray-500'}`}>전체 알람</button>
          <button type="button" aria-pressed={tab === 'requests'} onClick={() => setTab('requests')} className={`rounded-lg px-3 py-2 text-xs font-bold ${tab === 'requests' ? 'bg-blue-50 text-[#1344FF]' : 'text-gray-500'}`}>응답할 요청 {requestCount}</button>
        </div>
        <div className="max-h-[min(28rem,65dvh)] space-y-3 overflow-y-auto">
          {(notifications.isError || pending.isError || friendRequests.isError || friendStates.isError || unread.isError || (requestIds.length > 0 && statuses.isError)) && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {notifications.isError ? '알람 목록' : pending.isError ? '초대·권한 요청 목록' : friendRequests.isError || friendStates.isError ? '친구 요청 상태' : unread.isError ? '읽지 않은 알람 수' : '요청 처리 상태'}을 불러오지 못했습니다.
            <button type="button" className="ml-2 underline" onClick={() => void refresh()}>다시 시도</button>
          </div>}
          {tab === 'requests' ? <>
            <p className="text-xs leading-relaxed text-gray-500">알람을 삭제해도 요청은 남습니다. 수락 또는 거절로 응답해 주세요.</p>
            {friends.map(request => <div key={`friend:${request.id}`} className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
              <p className="text-sm"><strong>{request.requester.nickname}</strong>님에게서 친구 요청이 도착했습니다.</p>
              {friendActions(request)}
            </div>)}
            {invitations.map(invitation => <div key={invitation.collaborationRequestId} className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
              <span className="text-xs font-bold text-[#1344FF]">응답 대기</span>
              <p className="mt-1 text-sm leading-relaxed text-gray-700"><strong>{invitation.senderNickname}</strong>님이 <strong>'{invitation.planName}'</strong> {invitation.type === 'REQUEST' ? '일정의 편집 권한을 요청했습니다.' : '일정 편집 초대를 보냈습니다.'}</p>
              {requestActions(invitation)}
            </div>)}
            {(pending.isPending || friendRequests.isPending) && <p className="py-6 text-center text-sm text-gray-400">요청을 불러오는 중입니다.</p>}
            {!pending.isPending && !friendRequests.isPending && !pending.isError && !friendRequests.isError && !requestCount && <p className="py-8 text-center text-sm text-gray-400">응답할 요청이 없습니다.</p>}
          </> : <>
            {items.map(item => {
              const invitation = isRequest(item) ? invitations.find(invitation => String(invitation.collaborationRequestId) === item.action?.parameters?.collaborationRequestId) : undefined;
              const label = statusLabel(item);
              const busy = busyIds.has(`alarm:${item.id}`);
              return <div key={item.id} className={`relative rounded-xl border ${item.readAt ? 'border-gray-100 bg-gray-50' : 'border-blue-100 bg-blue-50/50'}`} aria-busy={busy}>
                <button type="button" disabled={busy} onClick={() => void openItem(item)} className="block w-full rounded-xl p-3 pr-10 text-left disabled:opacity-50">
                  <span className="flex items-center gap-2 text-sm font-bold text-gray-900">{!item.readAt && <span aria-label="읽지 않음" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1344FF]" />}{item.title}</span>
                  {label && <span className="mt-1 inline-block rounded bg-white px-1.5 py-0.5 text-xs font-semibold text-gray-500">{label}</span>}
                  <span className="mt-1 block text-sm leading-relaxed text-gray-600">{item.body}</span>
                  <time dateTime={item.createdAt} className="mt-2 block text-xs text-gray-400">{new Date(item.createdAt).toLocaleString('ko-KR')}</time>
                </button>
                <button type="button" disabled={busy} aria-label={`${item.title} 알람 삭제`} title="알람만 삭제" onClick={() => void dismiss(item)} className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"><X className="h-4 w-4" /></button>
                {item.type.endsWith('FRIEND_REQUESTED') && friends.filter(request => String(request.id) === item.action?.parameters?.friendRequestId).map(request => <div key={request.id} className="px-3 pb-3">{friendActions(request)}</div>)}
                {invitation && <div className="px-3 pb-3">{requestActions(invitation)}</div>}
              </div>;
            })}
            {notifications.isPending && <p className="py-6 text-center text-sm text-gray-400">알람을 불러오는 중입니다.</p>}
            {!notifications.isPending && !notifications.isError && !items.length && <p className="py-8 text-center text-sm text-gray-400">알람이 없습니다.</p>}
            {notifications.hasNextPage && <button type="button" disabled={notifications.isFetchingNextPage} onClick={() => void notifications.fetchNextPage()} className="w-full rounded-lg py-2 text-sm text-[#1344FF] disabled:opacity-50">{notifications.isFetchingNextPage ? '불러오는 중…' : '이전 알람 더 보기'}</button>}
          </>}
        </div>
      </div>}
    </div>
  );
}
