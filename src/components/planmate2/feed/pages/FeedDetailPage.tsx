import { ArrowLeft, BedDouble, Calendar, ChevronDown, ChevronUp, Clock, Coffee, Copy, CornerDownRight, ExternalLink, Landmark, MapPin, Pencil, Send, Share2, ShoppingBag, ThumbsDown, ThumbsUp, Trash2, Utensils } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CustomOverlayMap, Map as KakaoMap, Polyline } from 'react-kakao-maps-sdk';
import { useNavigate } from 'react-router-dom';
import { useApiClient } from '../../../../hooks/useApiClient';
import useKakaoLoader from '../../../../hooks/useKakaoLoader';
import type { CommunityComment, ItineraryDay } from '../../community/api/communityApi';
import { LevelBadge } from '../../community/atoms/LevelBadge';
import { useComments, useCreateComment, useDeleteComment, useDeletePost, useForkPost, usePost, useReactToPost, useSimilarFeedPosts } from '../../community/hooks/queries';
import { PostContentViewer } from '../../community/organisms/PostContentViewer';
import { ForkDateModal } from '../organisms/ForkDateModal';
import { ForkResultModal } from '../organisms/ForkResultModal';
import { buildKakaoMapUrl } from '../../common/kakaoMapLink';
import { UserAvatar } from '../../common/UserAvatar';
import { buildCreatePlanRequest, canForkItinerary } from '../utils/itineraryToPlan';

interface PostDetailProps {
  postId: number | string;
  onBack: () => void;
  onNavigate: (view: any, data?: any) => void;
}

const FALLBACK_ITEM_IMAGE = 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400';

/**
 * 지도 핀·경로선 색은 장소마다 다르게 준다. 순서대로 돌려 쓰되 이웃한 색끼리 최대한 멀리 떨어뜨려,
 * 붙어 있는 두 장소가 비슷한 색으로 보이지 않게 한다. 흰 글자를 얹으므로 전부 어두운 계열이다.
 */
const PLACE_COLORS = ['#1344FF', '#E11D48', '#059669', '#9333EA', '#EA580C', '#0891B2', '#CA8A04', '#DB2777'];
const placeColor = (index: number) => PLACE_COLORS[index % PLACE_COLORS.length];

/**
 * 일정 항목을 카카오맵에서 여는 링크.
 *
 * 좌표가 있으면 지도 중심을 좌표로 고정한다 — 이름만 넘기면 "간송옛집" 같은 이름이
 * 여러 곳일 때 다른 지역이 열린다. 좌표가 없으면 이름 + 주소로 검색어를 좁힌다.
 */
const placeMapUrl = (item: { place?: string; description?: string; lat?: number; lng?: number }) =>
  buildKakaoMapUrl({
    location: item.place,
    coords: item.lat && item.lng ? { lat: item.lat, lng: item.lng } : null,
    searchQuery: [item.place, item.description].filter(Boolean).join(' '),
  });

export default function PostDetail({ postId, onBack, onNavigate }: PostDetailProps) {
  useKakaoLoader();
  const [map, setMap] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [comment, setComment] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [selectedDay, setSelectedDay] = useState<number | 'all'>(1);
  const [isScheduleOpen, setIsScheduleOpen] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [focusedPlace, setFocusedPlace] = useState<number | null>(null);
  const [isForkDateOpen, setIsForkDateOpen] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [forkResult, setForkResult] = useState<{ planId: string; adjustedBlocks: number } | null>(null);

  const navigate = useNavigate();
  const { apiRequest } = useApiClient();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const { data: post, isLoading, isError } = usePost(postId);
  const { data: commentsPage } = useComments(postId);
  const { data: similarPosts } = useSimilarFeedPosts(post?.location || post?.region, postId);
  const createComment = useCreateComment(postId);
  const deleteComment = useDeleteComment(postId);
  const reactMutation = useReactToPost(postId);
  const forkMutation = useForkPost(postId);
  const deletePostMutation = useDeletePost();

  const myUserId = localStorage.getItem('userId');
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const isAuthor = !!post && myUserId === post.userId;

  // 평면 목록(parentId 포함)을 부모-대댓글로 그룹핑. 부모가 현재 페이지에 없으면 최상위로 노출
  const { topLevelComments, repliesByParent } = useMemo(() => {
    const items = commentsPage?.items ?? [];
    const ids = new Set(items.map(c => c.id));
    const top: CommunityComment[] = [];
    const byParent = new Map<number, CommunityComment[]>();
    for (const c of items) {
      if (c.parentId != null && ids.has(c.parentId)) {
        const list = byParent.get(c.parentId) ?? [];
        list.push(c);
        byParent.set(c.parentId, list);
      } else {
        top.push(c);
      }
    }
    return { topLevelComments: top, repliesByParent: byParent };
  }, [commentsPage]);

  const itineraryDays: ItineraryDay[] = post?.itinerary?.days ?? [];
  const currentSchedule = itineraryDays.find(d => d.day === selectedDay) ?? itineraryDays[0];

  /**
   * 지도와 타임라인이 함께 보는 항목 목록.
   * '전체'를 고르면 모든 날을 이어 붙이되 각 항목이 몇 일차였는지는 잃지 않는다 —
   * 날짜가 빠지면 "이 순서가 하루 안의 순서"라고 잘못 읽힌다.
   */
  const visibleItems = useMemo(
    () => selectedDay === 'all'
      ? itineraryDays.flatMap(d => (d.items ?? []).map(item => ({ ...item, day: d.day })))
      : (currentSchedule?.items ?? []).map(item => ({ ...item, day: currentSchedule!.day })),
    [selectedDay, itineraryDays, currentSchedule]
  );

  // 지도에 찍을 좌표(선택된 일차 기준) — 마커/경로선 공통으로 사용
  const mappedItems = useMemo(
    () => visibleItems
      .map((item, timelineIndex) => ({ ...item, timelineIndex }))
      .filter(item => item.lat && item.lng),
    [visibleItems]
  );

  const dayPositions = useMemo(
    () => visibleItems.filter(item => item.lat && item.lng).map(item => ({ lat: item.lat!, lng: item.lng! })),
    [visibleItems]
  );

  /**
   * 일정 카드를 누르면 위 지도를 그 장소로 옮긴다.
   * panTo 는 부드럽게 움직이지만 화면 밖으로 벗어난 거리는 순간이동하므로, 지도가 보이지 않는
   * 위치에 있으면 지도부터 화면에 들여놓는다 — 안 그러면 눌러도 아무 일도 안 일어난 것처럼 보인다.
   */
  const focusPlaceOnMap = (item: { lat?: number; lng?: number }, index: number) => {
    if (!item.lat || !item.lng) return;
    setFocusedPlace(index);
    map?.panTo(new window.kakao.maps.LatLng(item.lat, item.lng));
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const isLiked = post?.myReaction === 'like';
  const isDisliked = post?.myReaction === 'dislike';

  const requireLogin = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return false;
    }
    return true;
  };

  const handleReact = async (type: 'like' | 'dislike') => {
    if (!requireLogin()) return;
    try {
      await reactMutation.mutateAsync(type);
    } catch (error) {
      alert(`반응 처리에 실패했습니다: ${(error as Error).message}`);
    }
  };

  const isForkable = canForkItinerary(post?.itinerary);

  const handleFork = () => {
    if (!requireLogin()) return;
    if (!isForkable) return;
    setIsForkDateOpen(true);
  };

  /**
   * 가져가기 = 실제 복제.
   * 스냅샷으로 Backend-v2에 새 플랜을 만든 뒤에야 Community에 포크를 기록한다
   * (복제가 실패했는데 가져간 것으로 집계되면 안 되므로 순서가 중요하다).
   */
  const handleForkConfirm = async (startDate: Date) => {
    if (!post?.itinerary) return;
    setIsCreatingPlan(true);
    try {
      const { body, adjustedBlocks } = buildCreatePlanRequest(post.itinerary, startDate);
      const created = await apiRequest(`${BASE_URL}/api/plan/full`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const planId = created?.planId;
      if (!planId) throw new Error('플랜 생성 응답에 planId가 없습니다.');

      // 플랜 이름은 목적지명으로 생성되므로 여행기 제목으로 바꿔 목록에서 찾기 쉽게 한다.
      // 실패해도 복제 자체는 성공이므로 막지 않는다.
      try {
        await apiRequest(`${BASE_URL}/api/plan/${planId}/name`, {
          method: 'PATCH',
          // 플랜 이름은 100자 제한, 여행기 제목은 255자까지 가능
          body: JSON.stringify({ planName: post.title.slice(0, 100) }),
        });
      } catch {
        /* 이름 변경 실패는 무시 */
      }

      await forkMutation.mutateAsync();

      setIsForkDateOpen(false);
      setForkResult({ planId, adjustedBlocks });
    } catch (error) {
      alert(`일정을 가져오지 못했습니다: ${(error as Error).message}`);
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다!');
    } catch {
      alert('링크 복사에 실패했습니다.');
    }
  };

  const handleDeletePost = async () => {
    if (!post || !confirm('여행기를 삭제할까요? 삭제하면 되돌릴 수 없습니다.')) return;
    try {
      await deletePostMutation.mutateAsync(post.id);
      alert('여행기가 삭제되었습니다.');
      onNavigate('feed');
    } catch (error) {
      alert(`여행기 삭제에 실패했습니다: ${(error as Error).message}`);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireLogin() || !comment.trim()) return;
    try {
      await createComment.mutateAsync({ content: comment.trim() });
      setComment('');
    } catch (error) {
      alert(`댓글 등록에 실패했습니다: ${(error as Error).message}`);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!requireLogin() || !replyContent.trim()) return;
    try {
      await createComment.mutateAsync({ content: replyContent.trim(), parentId });
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      alert(`답글 등록에 실패했습니다: ${(error as Error).message}`);
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!confirm('댓글을 삭제할까요? 대댓글이 있으면 함께 삭제됩니다.')) return;
    try {
      await deleteComment.mutateAsync(commentId);
    } catch (error) {
      alert(`댓글 삭제에 실패했습니다: ${(error as Error).message}`);
    }
  };

  /**
   * 일정 블록 카테고리 표시.
   * 서버가 내려주는 값은 BlockCategory enum(ATTRACTION/ACCOMMODATION/RESTAURANT/CAFE/FREE/SEARCH)이라
   * 소문자 키로 비교하면 전부 기본값으로 떨어지고 배지에는 "ATTRACTION" 같은 영문이 그대로 찍힌다.
   */
  const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; chip: string; color: string; pin: React.ReactNode }> = {
    RESTAURANT: { label: '맛집', icon: <Utensils className="w-3.5 h-3.5 text-orange-500" />, chip: 'bg-orange-50 text-orange-700', color: '#F97316', pin: <Utensils className="w-4 h-4 text-white" /> },
    CAFE: { label: '카페', icon: <Coffee className="w-3.5 h-3.5 text-amber-500" />, chip: 'bg-amber-50 text-amber-700', color: '#D97706', pin: <Coffee className="w-4 h-4 text-white" /> },
    ACCOMMODATION: { label: '숙소', icon: <BedDouble className="w-3.5 h-3.5 text-purple-500" />, chip: 'bg-purple-50 text-purple-700', color: '#9333EA', pin: <BedDouble className="w-4 h-4 text-white" /> },
    SHOPPING: { label: '쇼핑', icon: <ShoppingBag className="w-3.5 h-3.5 text-pink-500" />, chip: 'bg-pink-50 text-pink-700', color: '#DB2777', pin: <ShoppingBag className="w-4 h-4 text-white" /> },
    ATTRACTION: { label: '관광', icon: <Landmark className="w-3.5 h-3.5 text-[#1344FF]" />, chip: 'bg-blue-50 text-[#1344FF]', color: '#1344FF', pin: <Landmark className="w-4 h-4 text-white" /> },
  };
  const categoryMeta = (category?: string | null) =>
    CATEGORY_META[(category ?? '').toUpperCase()]
    ?? { label: '일정', icon: <MapPin className="w-3.5 h-3.5 text-gray-400" />, chip: 'bg-gray-100 text-gray-600', color: '#6B7280', pin: <MapPin className="w-4 h-4 text-white" /> };

  // 지도의 중심과 경계 설정
  useEffect(() => {
    if (!map || !visibleItems.length) return;

    const bounds = new window.kakao.maps.LatLngBounds();
    let hasCoords = false;

    visibleItems.forEach((item) => {
      if (item.lat && item.lng) {
        bounds.extend(new window.kakao.maps.LatLng(item.lat, item.lng));
        hasCoords = true;
      }
    });

    if (hasCoords) {
      map.setBounds(bounds);
    }
  }, [map, visibleItems]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <p className="text-[#666666]">여행기를 불러오는 중...</p>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center gap-4">
        <p className="text-[#666666]">게시글을 찾을 수 없습니다.</p>
        <button onClick={onBack} className="px-6 py-2.5 bg-[#1344FF] text-white rounded-xl font-bold text-sm">
          돌아가기
        </button>
      </div>
    );
  }

  const description = post.contentText || '';
  // 본문은 BlockNote 블록으로 저장된다 — contentText만 쓰면 본문에 넣은 사진이 사라진다
  const contentBlocks = Array.isArray(post.content) ? (post.content as any[]) : null;
  const hasContent = !!contentBlocks?.length || !!description;
  const destination = post.location || post.region || '전국';
  const duration = post.durationDays
    ? (post.durationDays === 1 ? '1일' : `${post.durationDays - 1}박 ${post.durationDays}일`)
    : '1일';
  const totalPlaces = itineraryDays.reduce((acc, d) => acc + (d.items?.length ?? 0), 0);
  const commentCount = commentsPage?.totalElements ?? 0;

  // 작성자 아이콘 — 프로필 사진 → Gravatar → 이니셜 순
  const renderAvatar = (
    author: { author: string; authorImage?: string | null; authorAvatarHash?: string | null; authorDeleted?: boolean },
    sizeClass: string,
    onClick?: () => void,
  ) => (
    <UserAvatar
      name={author.author}
      imageUrl={author.authorImage}
      avatarHash={author.authorAvatarHash}
      sizeClass={sizeClass}
      fallbackClassName={author.authorDeleted ? 'bg-gray-200 text-gray-500' : undefined}
      onClick={author.authorDeleted ? undefined : onClick}
    />
  );

  /** 탈퇴한 작성자는 프로필로 보내지 않는다 (프로필 조회가 실패한다) */
  const goToProfile = (author: { userId: string; authorDeleted?: boolean }) =>
    author.authorDeleted ? undefined : () => onNavigate('mypage', { userId: author.userId });

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 lg:pb-8">
      {/* 썸네일 없는 헤더 — 사진 위 흰 글씨를 걷어낸 만큼 대비 걱정 없이 그냥 검은 글씨로 쓴다.
          줄 수를 아끼는 게 핵심이다: 여행 정보와 작성자를 각각 한 줄씩 쓰면 본문이 첫 화면 밖으로 밀린다.
          작성자 이름/날짜도 위아래로 쌓지 않고 한 줄에 이어 붙인다. */}
      <div className="bg-white border-b border-[#ececf0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          {/* 목록 버튼 · 제목 · 수정/삭제를 한 줄에 둔다. 제목만 늘어나고(min-w-0) 양쪽 버튼은 안 줄어든다 */}
          <div className="flex items-start gap-2 mb-2">
            <button
              onClick={onBack}
              aria-label="목록으로 돌아가기"
              title="목록으로 돌아가기"
              className="shrink-0 -ml-1.5 mt-0.5 sm:mt-1 p-1.5 rounded-lg text-[#5b6270] hover:text-[#1344FF] hover:bg-[#f4f5f7] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h1 className="flex-1 min-w-0 text-xl sm:text-[27px] font-bold text-[#16181d] leading-snug break-keep">{post.title}</h1>

            {/* 작성자 전용 수정/삭제 */}
            {isAuthor && (
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5 sm:mt-1">
                <button
                  onClick={() => onNavigate('feed-edit', { post })}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#e0e2e7] hover:border-[#1344FF] hover:text-[#1344FF] transition-colors text-[13px] font-bold text-[#5b6270]"
                >
                  <Pencil className="w-3.5 h-3.5" />수정
                </button>
                <button
                  onClick={handleDeletePost}
                  disabled={deletePostMutation.isPending}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#e0e2e7] hover:border-red-400 transition-colors text-[13px] font-bold text-red-500 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />삭제
                </button>
              </div>
            )}
          </div>

          {/* 작성자 + 여행 정보를 한 줄에 — 좁은 화면에서만 자연스럽게 두 줄로 접힌다 */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[12px] sm:pl-[34px]">
            <div
              className={`inline-flex items-center gap-1.5 transition-opacity ${post.authorDeleted ? '' : 'cursor-pointer hover:opacity-80'}`}
              onClick={goToProfile(post)}
            >
              {renderAvatar(post, 'w-6 h-6 text-[11px]')}
              <span className={`font-bold ${post.authorDeleted ? 'text-[#9aa0ab] italic' : 'text-[#16181d]'}`}>{post.author}</span>
              <LevelBadge level={post.level} />
            </div>

            {/* 여행 정보는 작성자 정보와 성격이 달라 구분선으로 끊는다 */}
            <span className="hidden sm:inline w-px h-3 bg-[#e0e2e7] mx-1" />
            <span className="inline-flex items-center gap-1 font-bold text-[#1344FF]">
              <MapPin className="w-3.5 h-3.5" />{destination}
            </span>
            <span className="text-[#c8ccd3]">·</span>
            <span className="inline-flex items-center gap-1 font-bold text-[#4b5563]">
              <Calendar className="w-3.5 h-3.5" />{duration}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* 여행기 본문 */}
            {hasContent && (
              <div className="bg-white rounded-2xl border border-[#ececf0] p-5 sm:p-6 mb-5">
                <h2 className="text-base font-bold text-[#111318] mb-4">여행기</h2>
                <div className="prose max-w-none text-[#3f4451] leading-[1.75] text-[15px]">
                  <PostContentViewer content={contentBlocks} contentText={description} />
                </div>
              </div>
            )}

            {/* 일정표 (Timeline View) — 일정 스냅샷이 있을 때만 */}
            {itineraryDays.length > 0 && currentSchedule && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer border-b border-gray-100"
                  onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                >
                  <div>
                    <h2 className="text-lg font-bold text-[#1a1a1a]">상세 일정</h2>
                    <p className="text-xs text-gray-500">총 {totalPlaces}개의 장소</p>
                  </div>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    {isScheduleOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#666666]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#666666]" />
                    )}
                  </button>
                </div>

                {isScheduleOpen && (
                  <div className="p-4 bg-gray-50/50">
                    {/* 일차 선택 (Sticky Tabs) */}
                    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm pb-3 -mx-4 px-4 border-b border-gray-100 mb-4">
                      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-3">
                        {/* 며칠짜리 여행인지, 동선이 전체적으로 어떻게 흐르는지는 하루씩 봐서는 알 수 없다 */}
                        {itineraryDays.length > 1 && (
                          <button
                            onClick={() => { setSelectedDay('all'); setFocusedPlace(null); }}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all font-bold text-xs ${selectedDay === 'all'
                              ? 'bg-[#1344FF] text-white shadow-sm'
                              : 'bg-white text-[#666666] border border-[#e5e7eb] hover:bg-gray-50'
                              }`}
                          >
                            전체
                          </button>
                        )}
                        {itineraryDays.map((schedule) => (
                          <button
                            key={schedule.day}
                            onClick={() => { setSelectedDay(schedule.day); setFocusedPlace(null); }}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all font-bold text-xs flex items-center gap-2 ${selectedDay === schedule.day
                                ? 'bg-[#1344FF] text-white shadow-sm'
                                : 'bg-white text-[#666666] border border-[#e5e7eb] hover:bg-gray-50'
                              }`}
                          >
                            Day {schedule.day}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 지도 — 좌표가 있는 항목이 있을 때만 */}
                    {dayPositions.length > 0 && (
                      <div ref={mapRef} className="mb-6 h-[300px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner relative group">
                        <KakaoMap
                          center={dayPositions[0]}
                          level={5}
                          style={{ width: '100%', height: '100%' }}
                          onCreate={setMap}
                        >
                          {/* 핀은 기본 마커 대신 직접 그린다 — 카테고리 색을 입히려면 이미지가 아니라
                              HTML 오버레이여야 하고, 그래야 타임라인 배지와 같은 색으로 맞출 수 있다 */}
                          {mappedItems.map((item, idx) => {
                            const meta = categoryMeta(item.category);
                            const color = placeColor(idx);
                            return (
                              <CustomOverlayMap
                                key={`pin-${idx}`}
                                position={{ lat: item.lat!, lng: item.lng! }}
                                yAnchor={1}
                                zIndex={focusedPlace === item.timelineIndex ? 10 : 1}
                              >
                                <button
                                  onClick={() => focusPlaceOnMap(item, item.timelineIndex)}
                                  title={`${idx + 1}. ${item.place} (${meta.label})`}
                                  className="flex flex-col items-center -mb-1"
                                >
                                  <span
                                    className={`flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full text-white shadow-lg ${focusedPlace === item.timelineIndex ? 'ring-2 ring-white scale-105' : ''
                                      }`}
                                    style={{ backgroundColor: color }}
                                  >
                                    {meta.pin}
                                    <span className="text-[13px] font-bold tabular-nums">{idx + 1}</span>
                                    {/* 이름이 없으면 지도만 보고는 어디인지 알 수 없다. 긴 이름은 잘라 지도를 덮지 않게 한다 */}
                                    <span className="text-[14px] font-bold max-w-[150px] truncate">{item.place}</span>
                                  </span>
                                  <span
                                    className="w-0 h-0 border-x-[6px] border-x-transparent border-t-[9px]"
                                    style={{ borderTopColor: color }}
                                  />
                                </button>
                              </CustomOverlayMap>
                            );
                          })}

                          {/* 구간 색은 그 구간이 도착하는 장소의 색을 따른다 — 선을 눈으로 따라가면
                              그 끝의 핀과 같은 색이라 "이 선이 어디로 가는 선인지"가 바로 읽힌다 */}
                          {mappedItems.length > 1 &&
                            mappedItems.slice(0, -1).map((item, idx) => (
                              <Polyline
                                key={`polyline-${idx}`}
                                path={[
                                  { lat: item.lat!, lng: item.lng! },
                                  { lat: mappedItems[idx + 1].lat!, lng: mappedItems[idx + 1].lng! },
                                ]}
                                strokeWeight={4}
                                strokeColor={placeColor(idx + 1)}
                                strokeOpacity={0.6}
                                strokeStyle={'arrow'}
                                endArrow={true}
                              />
                            ))}
                        </KakaoMap>

                        <div className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[9px] font-bold text-gray-500 shadow-sm border border-gray-100 uppercase tracking-tighter">
                          {selectedDay === 'all' ? '전체 경로' : `Day ${currentSchedule.day} Route Map`}
                        </div>
                      </div>
                    )}

                    {/* 타임라인 카드 리스트 */}
                    <div className="space-y-4">
                      {visibleItems.map((item, index, items) => (
                        <div
                          key={index}
                          onClick={() => focusPlaceOnMap(item, index)}
                          className={`relative flex gap-3 group ${item.lat && item.lng ? 'cursor-pointer' : ''}`}
                        >
                          {/* Time Marker */}
                          <div className="w-14 text-right pt-2 flex flex-col items-end gap-0.5 shrink-0">
                            <span className="font-bold text-[#1a1a1a] text-sm leading-none">{item.time}</span>
                            {/* 전체 보기에서는 시간만으로 며칠차인지 알 수 없다 */}
                            {selectedDay === 'all' && (
                              <span className="text-[10px] font-bold text-[#9aa0ab] leading-none">Day {item.day}</span>
                            )}
                          </div>

                          {/* 세로선은 컨테이너가 아니라 점 사이에 그린다 — 컨테이너에 절대배치하면
                              점의 실제 x좌표(시간 열 폭 + gap)와 어긋나고, 마지막 점 아래로 선이 삐져나온다 */}
                          <div className="flex flex-col items-center w-4 pt-2 shrink-0 relative">
                            {/* 점 색은 카드 테두리와 같은 것을 가리켜야 한다 — 선택 전에는 첫 장소가 기준점이다 */}
                            <div className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10 ${index === (focusedPlace ?? 0) ? 'bg-[#1344FF]' : 'bg-gray-300'
                              }`} />
                            {index < items.length - 1 && (
                              <div className="absolute left-1/2 -translate-x-1/2 top-[18px] -bottom-6 w-0.5 bg-gray-200" />
                            )}
                          </div>

                          {/* Card Content */}
                          <div className={`flex-1 bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all group-hover:border-[#1344FF]/30 ${focusedPlace === index ? 'border-2 border-[#1344FF]' : 'border border-gray-100'
                            }`}>
                            <div className="flex flex-col sm:flex-row">
                              {item.photoUrl && (
                                <div className="sm:w-32 h-32 sm:h-auto relative shrink-0">
                                  <img
                                    src={item.photoUrl || FALLBACK_ITEM_IMAGE}
                                    alt={item.place}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                </div>
                              )}

                              {/* Info Section */}
                              <div className="p-3 flex flex-col justify-between flex-1">
                                <div>
                                  <div className="flex items-center gap-2 mb-1.5">
                                    {item.category && (
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${categoryMeta(item.category).chip}`}>
                                        {categoryMeta(item.category).icon}
                                        {categoryMeta(item.category).label}
                                      </span>
                                    )}
                                    <h3 className="font-bold text-sm text-[#1a1a1a]">{item.place}</h3>
                                  </div>
                                  {item.description && (
                                    <p className="text-gray-600 text-[11px] leading-relaxed line-clamp-2">
                                      {item.description}
                                    </p>
                                  )}
                                </div>

                                {/* 이 서비스는 지도를 소유하지 않는다 — 영업시간·리뷰·길찾기가 필요한 순간에는
                                    카카오맵으로 넘긴다. 좌표가 있으면 검색어 대신 좌표로 보내 엉뚱한 동명 장소를 피한다 */}
                                <a
                                  href={placeMapUrl(item) ?? undefined}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  title="카카오맵에서 보기"
                                  aria-label={`${item.place ?? '장소'} 카카오맵에서 보기`}
                                  className="mt-2 self-start inline-flex items-center p-1.5 rounded-md border border-[#e5e7eb] text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 댓글 섹션 */}
            <div className="bg-white rounded-2xl border border-[#ececf0] p-5">
              <h2 className="text-base font-bold text-[#111318] mb-4">
                댓글 <span className="text-[#1344FF] tabular-nums">{commentCount}</span>
              </h2>

              {/* 메인 댓글 작성 */}
              {isLoggedIn ? (
                <form onSubmit={handleCommentSubmit} className="mb-5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="댓글을 입력하세요..."
                      className="flex-1 px-4 py-2.5 text-sm border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#1344FF] transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={createComment.isPending || !comment.trim()}
                      className="bg-[#1344FF] text-white px-4 py-2.5 rounded-xl hover:bg-[#0d34cc] transition-all shadow-sm flex items-center justify-center disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-5 p-4 rounded-xl bg-[#f8f9fa] border border-gray-100 text-sm text-[#5b6270] text-center">
                  댓글을 작성하려면 로그인하세요.
                </div>
              )}

              {/* 댓글 목록 */}
              <div className="space-y-4">
                {topLevelComments.length === 0 && (
                  <p className="text-center text-[#5b6270] text-sm py-4">첫 댓글을 남겨보세요!</p>
                )}
                {topLevelComments.map((c) => (
                  <div key={c.id} className="group">
                    {/* 상위 댓글 */}
                    <div className="flex gap-2.5">
                      {renderAvatar(c, 'w-8 h-8 text-xs', goToProfile(c))}
                      <div className="flex-1">
                        <div className="bg-[#f8f9fa] rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="font-bold text-xs text-[#1a1a1a] cursor-pointer hover:text-[#1344FF]"
                                onClick={() => onNavigate('mypage', { userId: c.userId })}
                              >
                                {c.author}
                              </span>
                              <LevelBadge level={c.level} />
                              <span className="text-[10px] text-[#666666]">{c.createdAt}</span>
                            </div>
                            {myUserId === c.userId && (
                              <button
                                onClick={() => handleCommentDelete(c.id)}
                                className="text-gray-300 hover:text-red-400 transition-colors"
                                aria-label="댓글 삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-[#444444] leading-relaxed whitespace-pre-wrap">{c.content}</p>
                        </div>
                        {isLoggedIn && (
                          <div className="flex items-center gap-4 mt-1.5 ml-1">
                            <button
                              onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                              className="text-[11px] text-[#666666] hover:text-[#1344FF] font-bold transition-colors"
                            >
                              답글 달기
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 대댓글 입력 폼 */}
                    {replyingTo === c.id && (
                      <div className="ml-10 mt-3 flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <CornerDownRight className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <form onSubmit={(e) => handleReplySubmit(e, c.id)} className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`@${c.author}님에게 답글 작성...`}
                            className="flex-1 px-3 py-2 text-xs border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#1344FF]"
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={createComment.isPending || !replyContent.trim()}
                            className="bg-[#1344FF] text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#0d34cc] disabled:opacity-40"
                          >
                            등록
                          </button>
                        </form>
                      </div>
                    )}

                    {/* 대댓글 목록 */}
                    {(repliesByParent.get(c.id)?.length ?? 0) > 0 && (
                      <div className="ml-10 mt-3 space-y-3 border-l-2 border-gray-100 pl-3">
                        {repliesByParent.get(c.id)!.map((reply) => (
                          <div key={reply.id} className="flex gap-2">
                            {renderAvatar(reply, 'w-7 h-7 text-[10px]', goToProfile(reply))}
                            <div className="flex-1">
                              <div className="bg-[#f8f9fa] rounded-xl p-2.5">
                                <div className="flex items-center justify-between mb-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="font-bold text-[11px] text-[#1a1a1a] cursor-pointer hover:text-[#1344FF]"
                                      onClick={() => onNavigate('mypage', { userId: reply.userId })}
                                    >
                                      {reply.author}
                                    </span>
                                    <LevelBadge level={reply.level} />
                                    <span className="text-[10px] text-[#666666]">{reply.createdAt}</span>
                                  </div>
                                  {myUserId === reply.userId && (
                                    <button
                                      onClick={() => handleCommentDelete(reply.id)}
                                      className="text-gray-300 hover:text-red-400 transition-colors"
                                      aria-label="답글 삭제"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-[#666666] whitespace-pre-wrap">{reply.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 같은 지역의 다른 여행기 — 여기까지 읽었다는 건 이 지역에 관심이 있다는 뜻이다.
                지역이 없는 글에서는 통째로 감춘다 (전국 최신글을 "비슷한 여행기"라 부를 수는 없다) */}
            {similarPosts && similarPosts.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#ececf0] p-5">
                <h2 className="text-base font-bold text-[#111318] mb-1">
                  {destination}의 다른 여행기
                </h2>
                <p className="text-[12px] text-[#6b7280] mb-4">추천이 많은 순으로 보여드려요</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {similarPosts.map((similar: any) => (
                    <button
                      key={similar.id}
                      onClick={() => onNavigate('detail', { post: similar })}
                      className="flex gap-3 items-center p-2 rounded-xl border border-[#ececf0] hover:border-[#1344FF] hover:bg-[#f7f9ff] transition-colors text-left group/similar"
                    >
                      <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-[#eef0f3]">
                        {similar.image ? (
                          <img src={similar.image} alt="" loading="lazy" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-[#b9bec7]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-bold text-[#16181d] truncate group-hover/similar:text-[#1344FF]">
                          {similar.title}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[#6b7280] truncate">
                          {similar.duration} · {similar.author}
                        </p>
                        <p className="mt-1 text-[11px] text-[#6b7280] tabular-nums">
                          추천 {similar.likes} · 가져감 {similar.forks}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 사이드바 — 예전처럼 오른쪽 칼럼에 sticky로 따라온다.
              그리드가 한 줄로 접히는 lg 미만에서는 아래 고정 바가 대신한다 */}
          <div className="hidden lg:block space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
              {/* 가져가기는 몇 번이든 가능하다 — 누를 때마다 내 여행에 새 플랜이 생긴다 */}
              <button
                onClick={handleFork}
                disabled={!isForkable || isCreatingPlan || forkMutation.isPending}
                className={`w-full py-3 rounded-lg transition-all shadow-sm font-bold text-sm flex items-center justify-center gap-2 ${!isForkable
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#1344FF] text-white hover:bg-[#0d34cc] disabled:opacity-60'
                  }`}
              >
                <Copy className="w-4 h-4" />
                {isCreatingPlan ? '가져오는 중...' : '이 일정 가져가기'}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${!isForkable ? 'bg-gray-200' : 'bg-white/20'}`}>
                  {post.forks ?? 0}
                </span>
              </button>

              {!isForkable ? (
                <p className="mt-2 mb-3 text-xs text-gray-400 text-center leading-relaxed">
                  이 여행기에는 가져갈 수 있는 일정 정보가 없어요
                </p>
              ) : post.myFork ? (
                <p className="mt-2 mb-3 text-xs text-gray-400 text-center">
                  이전에 가져간 일정이에요
                </p>
              ) : (
                <div className="mb-3" />
              )}

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleReact('like')}
                  aria-pressed={isLiked}
                  className={`flex-1 py-2.5 rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 ${isLiked
                    ? 'border-[#1344FF] text-[#1344FF] bg-blue-50'
                    : 'border-[#e5e7eb] text-[#666666] hover:border-[#1344FF] hover:text-[#1344FF]'
                    }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-[10px] font-bold">추천</span>
                  <span className="text-[10px] font-bold tabular-nums">{post.likes}</span>
                </button>
                <button
                  onClick={() => handleReact('dislike')}
                  aria-pressed={isDisliked}
                  className={`flex-1 py-2.5 rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 ${isDisliked
                    ? 'border-gray-900 text-gray-900 bg-gray-50'
                    : 'border-[#e5e7eb] text-[#666666] hover:border-gray-900 hover:text-gray-900'
                    }`}
                >
                  <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
                  <span className="text-[10px] font-bold">비추천</span>
                  <span className="text-[10px] font-bold tabular-nums">{post.dislikes}</span>
                </button>
                <button
                  onClick={handleShare}
                  aria-label="공유"
                  className="flex-1 py-2.5 rounded-lg border border-[#e5e7eb] text-[#666666] hover:border-[#1344FF] hover:text-[#1344FF] transition-all flex flex-col items-center justify-center gap-0.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-[10px] font-bold">공유</span>
                </button>
              </div>

              {/* 통계 */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">추천</span>
                  <span className="font-bold text-[#1a1a1a] tabular-nums">{post.likes}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">비추천</span>
                  <span className="font-bold text-[#1a1a1a] tabular-nums">{post.dislikes}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">조회수</span>
                  <span className="font-bold text-[#1a1a1a] tabular-nums">{post.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">가져감</span>
                  <span className="font-bold text-[#1a1a1a] tabular-nums">{post.forks ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">댓글</span>
                  <span className="font-bold text-[#1a1a1a] tabular-nums">{commentCount}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 모바일 고정 액션 바 — 이 화면의 목적은 "가져가기"다. 항상 엄지 근처에 둔다 */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-sm border-t border-[#ececf0] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleReact('like')}
            aria-pressed={isLiked}
            className={`flex flex-col items-center justify-center w-14 h-12 shrink-0 rounded-xl border transition-all ${isLiked
              ? 'border-[#1344FF] text-[#1344FF] bg-blue-50'
              : 'border-[#e5e7eb] text-[#6b7280]'
              }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-bold tabular-nums mt-0.5">{post.likes}</span>
          </button>
          <button
            onClick={handleShare}
            aria-label="공유"
            className="flex items-center justify-center w-12 h-12 shrink-0 rounded-xl border border-[#e5e7eb] text-[#6b7280]"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleFork}
            disabled={!isForkable || isCreatingPlan || forkMutation.isPending}
            className={`flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${!isForkable
              ? 'bg-[#f1f2f4] text-[#9aa0ab]'
              : 'bg-[#1344FF] text-white disabled:opacity-60'
              }`}
          >
            <Copy className="w-4 h-4" />
            {!isForkable ? '가져갈 일정이 없어요' : isCreatingPlan ? '가져오는 중...' : '이 일정 가져가기'}
          </button>
        </div>
      </div>

      <ForkDateModal
        isOpen={isForkDateOpen}
        onClose={() => setIsForkDateOpen(false)}
        dayCount={itineraryDays.length}
        isSubmitting={isCreatingPlan || forkMutation.isPending}
        onConfirm={handleForkConfirm}
      />

      <ForkResultModal
        isOpen={forkResult != null}
        onClose={() => setForkResult(null)}
        planName={post.title}
        adjustedBlocks={forkResult?.adjustedBlocks ?? 0}
        onEdit={() => navigate(`/complete?id=${forkResult?.planId}`)}
        onGoToMyTrips={() => navigate('/mypage')}
      />
    </div>
  );
}
