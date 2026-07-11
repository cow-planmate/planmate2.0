import { ArrowLeft, Calendar, Camera, Car, ChevronDown, ChevronUp, Clock, Coffee, Copy, CornerDownRight, Landmark, MapPin, Send, Share2, ShoppingBag, ThumbsDown, ThumbsUp, Users, Utensils } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Map, MapMarker, Polyline } from 'react-kakao-maps-sdk';
import useKakaoLoader from '../../../../hooks/useKakaoLoader';

interface PostDetailProps {
  post: any;
  onBack: () => void;
  onNavigate: (view: any, data?: any) => void;
}

interface Comment {
  id: number;
  author: string;
  authorImage: string;
  userId?: string; // Add userId to comment for profile navigation
  content: string;
  createdAt: string;
  likes: number;
  replies: Comment[];
}

const MOCK_SCHEDULE = [
  {
    day: 1,
    date: '2024.03.15',
    startTime: '09:00',
    endTime: '21:00',
    items: [
      {
        time: '10:00',
        place: '경복궁',
        description: '조선시대 궁궐 관람, 수문장 교대식 필수!',
        duration: 8,
        image: 'https://images.unsplash.com/photo-1693928105595-b323b02791ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        category: 'sightseeing',
        lat: 37.5796,
        lng: 126.9770
      },
      {
        time: '12:30',
        place: '토속촌 삼계탕',
        description: '점심식사, 인삼 가득한 보양식',
        duration: 4,
        image: 'https://images.unsplash.com/photo-1714317609749-d8a7927ceda6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        category: 'food',
        lat: 37.5778,
        lng: 126.9712
      },
      {
        time: '14:00',
        place: '북촌한옥마을',
        description: '전통 한옥 거리 산책 및 사진 촬영',
        duration: 8,
        image: 'https://images.unsplash.com/photo-1630135199928-55a43e87350d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        category: 'photo',
        lat: 37.5828,
        lng: 126.9836
      },
      {
        time: '16:30',
        place: '인사동',
        description: '전통 공예품 쇼핑 및 카페',
        duration: 6,
        image: 'https://images.unsplash.com/photo-1709983075478-4ec7b791329a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        category: 'shopping',
        lat: 37.5744,
        lng: 126.9856
      },
      {
        time: '18:30',
        place: '명동',
        description: '저녁식사 및 쇼핑',
        duration: 10,
        image: 'https://images.unsplash.com/photo-1667494398891-dd00bad6e8d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        category: 'food',
        lat: 37.5635,
        lng: 126.9863
      },
    ],
  },
  {
    day: 2,
    date: '2024.03.16',
    startTime: '10:00',
    endTime: '20:00',
    items: [
      {
        time: '10:30',
        place: '코엑스 별마당 도서관',
        description: '포토존 및 카페',
        duration: 6,
        image: 'https://images.unsplash.com/photo-1659243013574-3b0ffb781fe4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        category: 'photo',
        lat: 37.5117,
        lng: 127.0583
      },
      {
        time: '12:30',
        place: '강남역 맛집 거리',
        description: '점심식사',
        duration: 4,
        image: 'https://images.unsplash.com/photo-1722084426182-b88c8e217f10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        category: 'food',
        lat: 37.4979,
        lng: 127.0276
      },
      {
        time: '14:00',
        place: '가로수길',
        description: '카페 투어 및 쇼핑',
        duration: 8,
        image: 'https://images.unsplash.com/photo-1634028281608-d636a88abc09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        category: 'cafe',
        lat: 37.5208,
        lng: 127.0227
      },
      {
        time: '17:00',
        place: '한강공원',
        description: '자전거 대여 및 피크닉',
        duration: 12,
        image: 'https://images.unsplash.com/photo-1652172176566-5d69fc9d9961?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        category: 'activity',
        lat: 37.5110,
        lng: 127.0057
      },
    ],
  },
  {
    day: 3,
    date: '2024.03.17',
    startTime: '11:00',
    endTime: '20:00',
    items: [
      {
        time: '11:00',
        place: '홍대 거리',
        description: '브런치 및 거리 공연 관람',
        duration: 8,
        image: 'https://images.unsplash.com/photo-1748696009709-ffd507a4ef61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        category: 'activity',
        lat: 37.5565,
        lng: 126.9238
      },
      {
        time: '14:00',
        place: '망원한강공원',
        description: '한강 카페 거리',
        duration: 8,
        image: 'https://images.unsplash.com/photo-1652172176566-5d69fc9d9961?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        category: 'cafe',
        lat: 37.5513,
        lng: 126.8967
      },
      {
        time: '17:00',
        place: '이태원',
        description: '다국적 음식 및 루프탑 바',
        duration: 12,
        image: 'https://images.unsplash.com/photo-1719661665369-ac1205e478ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        category: 'food',
        lat: 37.5345,
        lng: 126.9945
      },
    ],
  },
];

const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    author: '여행매니아',
    authorImage: 'https://images.unsplash.com/photo-1640960543409-dbe56ccc30e2?w=100&h=100&fit=crop',
    userId: 'user1',
    content: '와 일정이 정말 알차네요! 가져가서 제 일정으로 사용하고 싶어요. 혹시 경복궁 입장료는 얼마였나요?',
    createdAt: '2시간 전',
    likes: 5,
    replies: [
      {
        id: 11,
        author: '작성자',
        authorImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        userId: 'planmate-author',
        content: '성인은 3000원인데 한복 입고 가면 무료예요! 꼭 한복 대여해서 가보세요 ㅎㅎ',
        createdAt: '1시간 전',
        likes: 2,
        replies: []
      }
    ]
  },
  {
    id: 2,
    author: '서울러버',
    authorImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    userId: 'user2',
    content: '북촌한옥마을 정말 좋죠! 저도 다녀왔는데 사진 찍기 좋더라구요. 주말엔 사람이 많으니 평일 추천드려요.',
    createdAt: '5시간 전',
    likes: 3,
    replies: []
  },
  {
    id: 3,
    author: '처음서울',
    authorImage: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    userId: 'user3',
    content: '서울 처음 가는데 이 일정 그대로 따라가면 될까요? 대중교통으로도 이동 가능한가요?',
    createdAt: '1일 전',
    likes: 2,
    replies: []
  },
];

export default function PostDetail({ post, onBack, onNavigate }: PostDetailProps) {
  useKakaoLoader();
  const [map, setMap] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [comment, setComment] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [selectedDay, setSelectedDay] = useState(MOCK_SCHEDULE[0].day);
  const [isScheduleOpen, setIsScheduleOpen] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const isTravelPost = !!(post.destination || post.schedule || post.location);
  const isMatePost = post.category === 'mate';
  const isQnaPost = post.category === 'qna';

  const tags = post.tags || (isTravelPost ? ['#서울여행', '#관광', '#맛집투어'] : (isMatePost ? ['#메이트찾기', '#동행'] : (isQnaPost ? ['#질문', '#도와주세요'] : ['#커뮤니티', '#소통'])));
  const description = post.description || post.content || (isTravelPost ? '서울의 과거와 현재를 잇는 2박 3일 힐링 도심 속 여행 코스입니다.' : '내용이 없습니다.');
  const author = post.author || '여행을사랑하는사람';
  const authorImage = post.authorImage || post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';
  const createdAt = post.createdAt || '3시간 전';
  const likes = (post.likes !== undefined ? post.likes : post.likeCount) || 0;
  const dislikes = (post.dislikes !== undefined ? post.dislikes : post.dislikeCount) || 0;
  const views = (post.views !== undefined ? post.views : post.viewCount) || 0;
  const commentsCount = (post.comments !== undefined ? post.comments : post.commentCount) || 0;

  const handleLikeClick = () => {
    if (isDisliked) setIsDisliked(false);
    setIsLiked(!isLiked);
  };

  const handleDislikeClick = () => {
    if (isLiked) setIsLiked(false);
    setIsDisliked(!isDisliked);
  };

  const handleFork = () => {
    alert(`"${post.title}" 여행 일정을 복제했습니다! 나만의 일정으로 수정해보세요.`);
  };

  const handleShare = () => {
    alert('링크가 클립보드에 복사되었습니다!');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      const newComment: Comment = {
        id: Date.now(),
        author: '나',
        authorImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        content: comment,
        createdAt: '방금 전',
        likes: 0,
        replies: []
      };
      setComments([newComment, ...comments]);
      setComment('');
    }
  };

  const handleReplySubmit = (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (replyContent.trim()) {
      const newReply: Comment = {
        id: Date.now(),
        author: '나',
        authorImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        content: replyContent,
        createdAt: '방금 전',
        likes: 0,
        replies: []
      };

      setComments(comments.map(c => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [...c.replies, newReply]
          };
        }
        return c;
      }));
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const getCurrentSchedule = () => {
    return MOCK_SCHEDULE.find(s => s.day === selectedDay) || MOCK_SCHEDULE[0];
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

  const getEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration * 30;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const currentSchedule = getCurrentSchedule();

  // 지도의 중심과 경계 설정을 위한 효과
  useEffect(() => {
    if (!map || !currentSchedule.items.length) return;

    const bounds = new window.kakao.maps.LatLngBounds();
    let hasCoords = false;

    currentSchedule.items.forEach((item: any) => {
      const lat = item.lat || item.ylocation;
      const lng = item.lng || item.xlocation;
      if (lat && lng) {
        bounds.extend(new window.kakao.maps.LatLng(lat, lng));
        hasCoords = true;
      }
    });

    if (hasCoords) {
      map.setBounds(bounds);
    }
  }, [map, selectedDay, currentSchedule]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-8">
      {/* 헤더 이미지 */}
      <div className={`relative ${isTravelPost ? 'h-[300px]' : 'h-[200px]'} overflow-hidden`}>
        <img
          src={post.image || 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200'}
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
              <img
                src={authorImage}
                alt={author}
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
              <div>
                <p className="text-white text-sm font-bold drop-shadow-sm">{author}</p>
                <div className="flex items-center gap-2 text-white/80 text-[11px]">
                  <span>{createdAt}</span>
                  <span className="w-0.5 h-0.5 bg-white/50 rounded-full" />
                  <span>조회 {views.toLocaleString()}</span>
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
            {!isTravelPost && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                  <h2 className="text-lg font-bold text-[#1a1a1a]">게시글 내용</h2>
                  {isQnaPost && (
                    post.isAnswered ? (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold">답변완료</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold">답변대기</span>
                    )
                  )}
                  {isMatePost && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-[#1344FF] rounded-lg text-xs font-bold">
                      <Users className="w-3.5 h-3.5" />
                      동행 {post.participants || 1}/{post.maxParticipants || 4}
                    </div>
                  )}
                </div>
                <div className="prose max-w-none text-[#4a4a4a] leading-relaxed text-base whitespace-pre-wrap">
                  {description}
                </div>
                {isMatePost && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <button className="w-full bg-[#1344FF] text-white py-3 rounded-lg font-bold hover:bg-[#0d34cc] transition-all text-sm shadow-sm">
                      동행 신청하기
                    </button>
                  </div>
                )}
              </div>
            )}

            {isTravelPost && (
              <>
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
                        <p className="text-sm font-bold text-[#1a1a1a]">{post.destination || post.location || '전국'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[#1344FF]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#666666]">기간</p>
                        <p className="text-sm font-bold text-[#1a1a1a]">{post.duration || '1일'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#1344FF]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#666666]">인원</p>
                        <p className="text-sm font-bold text-[#1a1a1a]">2명</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Car className="w-5 h-5 text-[#1344FF]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#666666]">이동수단</p>
                        <p className="text-sm font-bold text-[#1a1a1a]">대중교통</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 블로그형 글 내용 추가 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
                  <h2 className="text-lg font-bold text-[#1a1a1a] mb-4 border-b border-gray-100 pb-3">여행기</h2>
                  <div className="prose max-w-none text-[#4a4a4a] leading-relaxed text-base whitespace-pre-wrap">
                    {description}
                  </div>
                </div>

                {/* 일정표 (Timeline View) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer border-b border-gray-100"
                    onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                  >
                    <div>
                      <h2 className="text-lg font-bold text-[#1a1a1a]">상세 일정</h2>
                      <p className="text-xs text-gray-500">총 {MOCK_SCHEDULE.reduce((acc, curr) => acc + curr.items.length, 0)}개의 장소</p>
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
                          {MOCK_SCHEDULE.map((schedule) => (
                            <button
                              key={schedule.day}
                              onClick={() => setSelectedDay(schedule.day)}
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

                      {/* 지도 섹션 추가 */}
                      <div className="mb-6 h-[300px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner relative group">
                        <Map
                          center={{ lat: 37.5665, lng: 126.9780 }}
                          level={5}
                          style={{ width: '100%', height: '100%' }}
                          onCreate={setMap}
                        >
                          {currentSchedule.items.map((item: any, idx: number) => {
                            const lat = item.lat || item.ylocation;
                            const lng = item.lng || item.xlocation;
                            if (!lat || !lng) return null;

                            return (
                              <MapMarker
                                key={idx}
                                position={{ lat, lng }}
                                image={{
                                  src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                                  size: { width: 24, height: 35 }
                                }}
                              >
                                <div className="p-1 px-2 text-[10px] font-bold text-[#1344FF] bg-white rounded border border-[#1344FF] -mt-10">
                                  {idx + 1}. {item.place || item.location}
                                </div>
                              </MapMarker>
                            );
                          })}

                          <Polyline
                            path={currentSchedule.items
                              .map((item: any) => ({
                                lat: item.lat || item.ylocation,
                                lng: item.lng || item.xlocation
                              }))
                              .filter((p: any) => p.lat && p.lng)
                            }
                            strokeWeight={3}
                            strokeColor="#1344FF"
                            strokeOpacity={0.6}
                            strokeStyle="shortdashdot"
                          />
                        </Map>

                        {/* Map Overlay Info */}
                        <div className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[9px] font-bold text-gray-500 shadow-sm border border-gray-100 uppercase tracking-tighter">
                          Day {selectedDay} Route Map
                        </div>
                      </div>

                      {/* 타임라인 카드 리스트 */}
                      <div className="relative space-y-4">
                        {/* Vertical Line */}
                        <div className="absolute left-[72px] top-4 bottom-4 w-0.5 bg-gray-200" />

                        {(post.schedule || currentSchedule.items).map((item: any, index: number) => (
                          <div key={index} className="relative flex gap-3 group">
                            {/* Time Marker */}
                            <div className="w-14 text-right pt-2 flex flex-col items-end gap-0.5 shrink-0">
                              <span className="font-bold text-[#1a1a1a] text-sm leading-none">{item.time}</span>
                              <span className="text-[10px] text-gray-400 font-medium">~{getEndTime(item.time, item.duration || 2)}</span>
                            </div>

                            <div className="flex flex-col items-center w-4 pt-2 shrink-0 relative">
                              <div className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10 ${index === 0 ? 'bg-[#1344FF]' : 'bg-gray-300'
                                }`} />
                            </div>

                            {/* Card Content */}
                            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group-hover:border-[#1344FF]/30">
                              <div className="flex flex-col sm:flex-row">
                                {/* Image Section */}
                                <div className="sm:w-32 h-32 sm:h-auto relative shrink-0">
                                  <img
                                    src={item.image || 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400'}
                                    alt={item.place || item.location}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                </div>

                                {/* Info Section */}
                                <div className="p-3 flex flex-col justify-between flex-1">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(item.category || 'default')}`}>
                                        {item.category?.toUpperCase() || 'VISIT'}
                                      </span>
                                      <h3 className="font-bold text-sm text-[#1a1a1a]">{item.place || item.location}</h3>
                                    </div>
                                    <p className="text-gray-600 text-[11px] leading-relaxed line-clamp-2">
                                      {item.description}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-50">
                                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {(item.duration || 2) * 30}분
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        지도
                                      </span>
                                    </div>
                                    <button className="text-[#1344FF] text-xs font-bold hover:underline">
                                      상세
                                    </button>
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
              </>
            )}

            {/* 댓글 섹션 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-[#1a1a1a] mb-5">
                댓글 <span className="text-[#1344FF]">{comments.length}</span>
              </h2>

              {/* 메인 댓글 작성 */}
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
                    className="bg-[#1344FF] text-white px-4 py-2.5 rounded-xl hover:bg-[#0d34cc] transition-all shadow-sm flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* 댓글 목록 */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="group">
                    {/* 상위 댓글 */}
                    <div className="flex gap-2.5">
                      <img
                        src={comment.authorImage}
                        alt={comment.author}
                        className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80"
                        onClick={() => comment.userId && onNavigate('mypage', { userId: comment.userId })}
                      />
                      <div className="flex-1">
                        <div className="bg-[#f8f9fa] rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="font-bold text-xs text-[#1a1a1a] cursor-pointer hover:text-[#1344FF]"
                              onClick={() => comment.userId && onNavigate('mypage', { userId: comment.userId })}
                            >
                              {comment.author}
                            </span>
                            <span className="text-[10px] text-[#666666]">{comment.createdAt}</span>
                          </div>
                          <p className="text-sm text-[#444444] leading-relaxed">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 ml-1">
                          <button className="text-[11px] text-[#666666] hover:text-[#1344FF] flex items-center gap-1 transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            추천 {comment.likes}
                          </button>
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="text-[11px] text-[#666666] hover:text-[#1344FF] font-bold transition-colors"
                          >
                            답글 달기
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 대댓글 입력 폼 */}
                    {replyingTo === comment.id && (
                      <div className="ml-10 mt-3 flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <CornerDownRight className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`@${comment.author}님에게 답글 작성...`}
                            className="flex-1 px-3 py-2 text-xs border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#1344FF]"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="bg-[#1344FF] text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#0d34cc]"
                          >
                            등록
                          </button>
                        </form>
                      </div>
                    )}

                    {/* 대댓글 목록 */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-10 mt-3 space-y-3 border-l-2 border-gray-100 pl-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2">
                            <img
                              src={reply.authorImage}
                              alt={reply.author}
                              className="w-7 h-7 rounded-full object-cover cursor-pointer hover:opacity-80"
                              onClick={() => reply.userId && onNavigate('mypage', { userId: reply.userId })}
                            />
                            <div className="flex-1">
                              <div className="bg-[#f8f9fa] rounded-xl p-2.5">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span
                                    className="font-bold text-[11px] text-[#1a1a1a] cursor-pointer hover:text-[#1344FF]"
                                    onClick={() => reply.userId && onNavigate('mypage', { userId: reply.userId })}
                                  >
                                    {reply.author}
                                  </span>
                                  <span className="text-[10px] text-[#666666]">{reply.createdAt}</span>
                                </div>
                                <p className="text-sm text-[#666666]">{reply.content}</p>
                              </div>
                              <button className="text-xs text-[#666666] hover:text-[#1344FF] mt-1 flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                추천 {reply.likes}
                              </button>
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
              {isTravelPost && (
                <button
                  onClick={handleFork}
                  className="w-full bg-[#1344FF] text-white py-3 rounded-lg hover:bg-[#0d34cc] transition-all shadow-sm font-bold text-sm mb-3 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  이 일정 가져가기
                  <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
                    {post.forks || 0}
                  </span>
                </button>
              )}

              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleLikeClick}
                  className={`flex-1 py-2.5 rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 ${isLiked
                    ? 'border-[#1344FF] text-[#1344FF] bg-blue-50'
                    : 'border-[#e5e7eb] text-[#666666] hover:border-[#1344FF] hover:text-[#1344FF]'
                    }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-[10px] font-bold">추천</span>
                  <span className="text-[10px] font-bold">{(post.likes || 0) + (isLiked ? 1 : 0)}</span>
                </button>
                <button
                  onClick={handleDislikeClick}
                  className={`flex-1 py-2.5 rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 ${isDisliked
                    ? 'border-gray-900 text-gray-900 bg-gray-50'
                    : 'border-[#e5e7eb] text-[#666666] hover:border-gray-900 hover:text-gray-900'
                    }`}
                >
                  <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
                  <span className="text-[10px] font-bold">비추천</span>
                  <span className="text-[10px] font-bold">{(post.dislikes || 0) + (isDisliked ? 1 : 0)}</span>
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
                  <span className="font-bold text-[#1a1a1a]">{(post.likes || 0) + (isLiked ? 1 : 0)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">비추천</span>
                  <span className="font-bold text-[#1a1a1a]">{(post.dislikes || 0) + (isDisliked ? 1 : 0)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">조회수</span>
                  <span className="font-bold text-[#1a1a1a]">1,234</span>
                </div>
                {isTravelPost && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">가져감</span>
                    <span className="font-bold text-[#1a1a1a]">{post.forks || 0}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">댓글</span>
                  <span className="font-bold text-[#1a1a1a]">{comments.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
