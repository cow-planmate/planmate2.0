import { ArrowLeft, Calendar, Camera, ChevronDown, ChevronUp, Clock, Coffee, Copy, CornerDownRight, Landmark, MapPin, Pencil, Send, Share2, ShoppingBag, ThumbsDown, ThumbsUp, Trash2, Utensils } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Map as KakaoMap, MapMarker, Polyline } from 'react-kakao-maps-sdk';
import { useNavigate } from 'react-router-dom';
import { useApiClient } from '../../../../hooks/useApiClient';
import useKakaoLoader from '../../../../hooks/useKakaoLoader';
import type { CommunityComment, ItineraryDay } from '../../community/api/communityApi';
import { LevelBadge } from '../../community/atoms/LevelBadge';
import { useComments, useCreateComment, useDeleteComment, useDeletePost, useForkPost, usePost, useReactToPost } from '../../community/hooks/queries';
import { PostContentViewer } from '../../community/organisms/PostContentViewer';
import { ForkDateModal } from '../organisms/ForkDateModal';
import { ForkResultModal } from '../organisms/ForkResultModal';
import { UserAvatar } from '../../common/UserAvatar';
import { buildCreatePlanRequest, canForkItinerary } from '../utils/itineraryToPlan';

interface PostDetailProps {
  postId: number | string;
  onBack: () => void;
  onNavigate: (view: any, data?: any) => void;
}

const FALLBACK_HEADER_IMAGE = 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200';
const FALLBACK_ITEM_IMAGE = 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400';

export default function PostDetail({ postId, onBack, onNavigate }: PostDetailProps) {
  useKakaoLoader();
  const [map, setMap] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [isScheduleOpen, setIsScheduleOpen] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [isForkDateOpen, setIsForkDateOpen] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [forkResult, setForkResult] = useState<{ planId: string; adjustedBlocks: number } | null>(null);

  const navigate = useNavigate();
  const { apiRequest } = useApiClient();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const { data: post, isLoading, isError } = usePost(postId);
  const { data: commentsPage } = useComments(postId);
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

  // 지도에 찍을 좌표(선택된 일차 기준) — 마커/경로선 공통으로 사용
  const dayPositions = useMemo(
    () =>
      (currentSchedule?.items ?? [])
        .filter(item => item.lat && item.lng)
        .map(item => ({ lat: item.lat!, lng: item.lng! })),
    [currentSchedule]
  );

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'cafe': return <Coffee className="w-4 h-4 text-amber-500" />;
      case 'photo': return <Camera className="w-4 h-4 text-pink-500" />;
      case 'shopping': return <ShoppingBag className="w-4 h-4 text-purple-500" />;
      default: return <Landmark className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'cafe': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'photo': return 'bg-pink-50 border-pink-200 text-pink-700';
      case 'shopping': return 'bg-purple-50 border-purple-200 text-purple-700';
      default: return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  // 지도의 중심과 경계 설정
  useEffect(() => {
    if (!map || !currentSchedule?.items?.length) return;

    const bounds = new window.kakao.maps.LatLngBounds();
    let hasCoords = false;

    currentSchedule.items.forEach((item) => {
      if (item.lat && item.lng) {
        bounds.extend(new window.kakao.maps.LatLng(item.lat, item.lng));
        hasCoords = true;
      }
    });

    if (hasCoords) {
      map.setBounds(bounds);
    }
  }, [map, selectedDay, currentSchedule]);

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

  const tags = post.tags ?? [];
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
    author: { author: string; authorImage?: string | null; authorAvatarHash?: string | null },
    sizeClass: string,
    onClick?: () => void,
  ) => (
    <UserAvatar
      name={author.author}
      imageUrl={author.authorImage}
      avatarHash={author.authorAvatarHash}
      sizeClass={sizeClass}
      onClick={onClick}
    />
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-8">
      {/* 헤더 이미지 */}
      <div className="relative h-[300px] overflow-hidden">
        <img
          src={post.image || FALLBACK_HEADER_IMAGE}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80" />

        {/* 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all shadow-lg z-20"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>

        {/* 작성자 전용 수정/삭제 */}
        {isAuthor && (
          <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
            <button
              onClick={() => onNavigate('feed-edit', { post })}
              className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-full hover:bg-white transition-all shadow-lg text-sm font-bold text-[#1a1a1a]"
            >
              <Pencil className="w-4 h-4" />수정
            </button>
            <button
              onClick={handleDeletePost}
              disabled={deletePostMutation.isPending}
              className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-full hover:bg-white transition-all shadow-lg text-sm font-bold text-red-500 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />삭제
            </button>
          </div>
        )}

        {/* 제목 & 기본 정보 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[#1344FF] text-[11px] rounded-lg font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{post.title}</h1>

            {/* 작성자 정보 */}
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onNavigate('mypage', { userId: post.userId })}
            >
              {renderAvatar(post, 'w-10 h-10 border-2 border-white shadow-sm text-sm')}
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-white text-sm font-bold drop-shadow-sm">{post.author}</p>
                  <LevelBadge level={post.level} />
                </div>
                <div className="flex items-center gap-2 text-white/80 text-[11px]">
                  <span>{post.createdAt}</span>
                  <span className="w-0.5 h-0.5 bg-white/50 rounded-full" />
                  <span>조회 {post.views.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 여행 정보 카드 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
              <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">여행 정보</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#1344FF]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#666666]">목적지</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">{destination}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#1344FF]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#666666]">기간</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">{duration}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 여행기 본문 */}
            {hasContent && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
                <h2 className="text-lg font-bold text-[#1a1a1a] mb-4 border-b border-gray-100 pb-3">여행기</h2>
                <div className="prose max-w-none text-[#4a4a4a] leading-relaxed text-base">
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
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide pt-3">
                        {itineraryDays.map((schedule) => (
                          <button
                            key={schedule.day}
                            onClick={() => setSelectedDay(schedule.day)}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all font-bold text-xs flex items-center gap-2 ${currentSchedule.day === schedule.day
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
                      <div className="mb-6 h-[300px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner relative group">
                        <KakaoMap
                          center={dayPositions[0]}
                          level={5}
                          style={{ width: '100%', height: '100%' }}
                          onCreate={setMap}
                        >
                          {(currentSchedule.items ?? [])
                            .filter(item => item.lat && item.lng)
                            .map((item, idx) => (
                              <MapMarker
                                key={idx}
                                position={{ lat: item.lat!, lng: item.lng! }}
                              >
                                <div className="p-2 w-[159px]">
                                  <p className="text-sm font-semibold truncate">{item.place}</p>
                                  <div className="flex items-center space-x-1">
                                    <div className="text-xs w-[22px] h-[22px] border border-main text-main font-semibold rounded-full flex items-center justify-center shrink-0">
                                      {idx + 1}
                                    </div>
                                  </div>
                                </div>
                              </MapMarker>
                            ))}

                          {dayPositions.length > 1 &&
                            dayPositions.slice(0, -1).map((pos, idx) => (
                              <Polyline
                                key={`polyline-${idx}`}
                                path={[pos, dayPositions[idx + 1]]}
                                strokeWeight={4}
                                strokeColor={'#1344FF'}
                                strokeOpacity={0.5}
                                strokeStyle={'arrow'}
                                endArrow={true}
                              />
                            ))}
                        </KakaoMap>

                        <div className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[9px] font-bold text-gray-500 shadow-sm border border-gray-100 uppercase tracking-tighter">
                          Day {currentSchedule.day} Route Map
                        </div>
                      </div>
                    )}

                    {/* 타임라인 카드 리스트 */}
                    <div className="relative space-y-4">
                      <div className="absolute left-[72px] top-4 bottom-4 w-0.5 bg-gray-200" />

                      {(currentSchedule.items ?? []).map((item, index) => (
                        <div key={index} className="relative flex gap-3 group">
                          {/* Time Marker */}
                          <div className="w-14 text-right pt-2 flex flex-col items-end gap-0.5 shrink-0">
                            <span className="font-bold text-[#1a1a1a] text-sm leading-none">{item.time}</span>
                          </div>

                          <div className="flex flex-col items-center w-4 pt-2 shrink-0 relative">
                            <div className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10 ${index === 0 ? 'bg-[#1344FF]' : 'bg-gray-300'
                              }`} />
                          </div>

                          {/* Card Content */}
                          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group-hover:border-[#1344FF]/30">
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
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(item.category)}`}>
                                        {item.category.toUpperCase()}
                                      </span>
                                    )}
                                    {getCategoryIcon(item.category ?? 'default')}
                                    <h3 className="font-bold text-sm text-[#1a1a1a]">{item.place}</h3>
                                  </div>
                                  {item.description && (
                                    <p className="text-gray-600 text-[11px] leading-relaxed line-clamp-2">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-[#1a1a1a] mb-5">
                댓글 <span className="text-[#1344FF]">{commentCount}</span>
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
                <div className="mb-5 p-4 rounded-xl bg-[#f8f9fa] border border-gray-100 text-sm text-gray-400 text-center">
                  댓글을 작성하려면 로그인하세요.
                </div>
              )}

              {/* 댓글 목록 */}
              <div className="space-y-4">
                {topLevelComments.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-4">첫 댓글을 남겨보세요!</p>
                )}
                {topLevelComments.map((c) => (
                  <div key={c.id} className="group">
                    {/* 상위 댓글 */}
                    <div className="flex gap-2.5">
                      {renderAvatar(c, 'w-8 h-8 text-xs', () => onNavigate('mypage', { userId: c.userId }))}
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
                            {renderAvatar(reply, 'w-7 h-7 text-[10px]', () => onNavigate('mypage', { userId: reply.userId }))}
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
          </div>

          {/* 사이드바 */}
          <div className="space-y-4">
            {/* 액션 버튼 */}
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
                이 일정 가져가기
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
                  className={`flex-1 py-2.5 rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 ${isLiked
                    ? 'border-[#1344FF] text-[#1344FF] bg-blue-50'
                    : 'border-[#e5e7eb] text-[#666666] hover:border-[#1344FF] hover:text-[#1344FF]'
                    }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-[10px] font-bold">추천</span>
                  <span className="text-[10px] font-bold">{post.likes}</span>
                </button>
                <button
                  onClick={() => handleReact('dislike')}
                  className={`flex-1 py-2.5 rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 ${isDisliked
                    ? 'border-gray-900 text-gray-900 bg-gray-50'
                    : 'border-[#e5e7eb] text-[#666666] hover:border-gray-900 hover:text-gray-900'
                    }`}
                >
                  <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
                  <span className="text-[10px] font-bold">비추천</span>
                  <span className="text-[10px] font-bold">{post.dislikes}</span>
                </button>
                <button
                  onClick={handleShare}
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
                  <span className="font-bold text-[#1a1a1a]">{post.likes}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">비추천</span>
                  <span className="font-bold text-[#1a1a1a]">{post.dislikes}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">조회수</span>
                  <span className="font-bold text-[#1a1a1a]">{post.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">가져감</span>
                  <span className="font-bold text-[#1a1a1a]">{post.forks ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">댓글</span>
                  <span className="font-bold text-[#1a1a1a]">{commentCount}</span>
                </div>
              </div>
            </div>
          </div>
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
