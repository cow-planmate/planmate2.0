import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CommunityCreatePage as CommunityCreate } from '../components/planmate2/community/pages/CommunityCreatePage';
import { CommunityPage as BoardList } from '../components/planmate2/community/pages/CommunityPage';
import { PostDetailPage as CommunityPostDetail } from '../components/planmate2/community/pages/PostDetailPage';
import { RecommendDetailPage as RecommendDetail } from '../components/planmate2/community/pages/RecommendDetailPage';
import CreatePost from '../components/planmate2/create-feed/pages/CreatePostPage';
import PostDetail from '../components/planmate2/feed/pages/FeedDetailPage';
import MainFeed from '../components/planmate2/feed/pages/MainFeed';
import MyPage from '../components/planmate2/mypage/pages/my-page';
import Navbar from '../components/planmate2/navbar';
import { ChatModal } from '../components/planmate2/social/molecules/ChatModal';
import { SocialPage } from '../components/planmate2/social/pages/SocialPage';
import { useSocialSse } from '../components/planmate2/social/hooks/useSocialSse';
import { useNotificationSse } from '../shared/notifications/useNotificationSse';
import Home from './Home';

export default function PlanmateV2() {
  // 두 스트림은 별개다. 알림은 알림 센터가, 채팅은 여전히 Social 이 소유한다.
  useSocialSse();
  useNotificationSse();
  const location = useLocation();
  const navigate = useNavigate();
  const { category, id, region, userId } = useParams();

  // URL에서 초기 뷰를 결정하는 함수
  const getInitialView = () => {
    const path = window.location.pathname;
    if (path.startsWith('/mypage')) return 'mypage';
    if (path === '/social') return 'social';
    if (path.startsWith('/community')) {
      if (path === '/community/create') return 'community-create';
      if (path.startsWith('/community/edit/')) return 'community-edit';
      if (path.split('/').length > 3) return 'detail'; // /community/category/id
      return 'board-list';
    }
    if (path.startsWith('/travel/edit/')) return 'feed-edit';
    if (path.startsWith('/travel')) return 'detail';
    if (path === '/plan-maker') return 'plan-maker';
    if (path === '/create-post') return 'create';
    return 'feed';
  };

  const ArrayBoardTypes = ['free', 'qna', 'mate', 'recommend'] as const;
  const getInitialBoardType = () => {
    if (category && (ArrayBoardTypes as any).includes(category)) return category as any;
    return 'free';
  };

  const [currentView, setCurrentView] = useState<'feed' | 'detail' | 'create' | 'feed-edit' | 'mypage' | 'board-list' | 'plan-maker' | 'community-create' | 'community-edit' | 'recommend-detail' | 'social'>(getInitialView() as any);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [boardType, setBoardType] = useState<'free' | 'qna' | 'mate' | 'recommend'>('free');
  const [filterRegion, setFilterRegion] = useState<string>(region ? decodeURIComponent(region) : '전체');
  // 마이페이지로 전환할 때 currentView는 즉시 바뀌지만 useParams().userId는 navigate가 커밋된
  // 다음 렌더에야 들어온다. 그 한 프레임 동안 MyPage가 옛 userId로 마운트되어 엉뚱한 프로필이
  // 잠깐 보이므로, 이동 시점의 대상을 여기 먼저 담아둔다.
  //   undefined = 대기 중인 이동 없음(useParams가 진실) / null = 내 마이페이지 / string = 상대 id
  const [pendingUserId, setPendingUserId] = useState<string | null | undefined>(undefined);
  const activeProfileUserId = pendingUserId !== undefined ? (pendingUserId ?? undefined) : userId;

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<any>(null);

  const handleGlobalChat = (user: any) => {
    setSelectedChatUser(user);
    setIsChatModalOpen(true);
  };

  useEffect(() => {
    const path = location.pathname;
    
    if (path.startsWith('/mypage')) {
      setCurrentView('mypage');
      // URL이 커밋됐으므로 useParams().userId가 진실이 된다 — 임시값은 여기서 버린다
      setPendingUserId(undefined);
    } else if (path === '/social') {
      setCurrentView('social');
    } else if (path.startsWith('/community')) {
      if (path === '/community/create' || path.startsWith('/community/create/')) {
        setCurrentView('community-create');
        const typeFromPath = path.split('/')[3];
        if (typeFromPath && ['free', 'qna', 'mate', 'recommend'].includes(typeFromPath)) {
          setBoardType(typeFromPath as any);
        }
      } else if (path.startsWith('/community/edit/')) {
        setCurrentView('community-edit');
        if (category && ['free', 'qna', 'mate', 'recommend'].includes(category)) {
          setBoardType(category as any);
        }
      } else if (category === 'recommend' && id) {
        // 장소 추천 상세 페이지 (특수 뷰)
        setCurrentView('recommend-detail');
        setBoardType('recommend');
      } else if (category && id) {
        // 일반 커뮤니티 게시글 상세
        setCurrentView('detail');
        setBoardType(category as any);
      } else if (category) {
        if (['free', 'qna', 'mate', 'recommend'].includes(category)) {
          setCurrentView('board-list');
          setBoardType(category as any);
        } else {
          setCurrentView('board-list');
          setBoardType('free');
        }
      } else {
        setCurrentView('board-list');
        setBoardType('free');
      }
    } else if (path.startsWith('/travel/edit/')) {
      setCurrentView('feed-edit');
    } else if (path.startsWith('/travel')) {
      setCurrentView('detail');
    } else if (path.startsWith('/feed')) {
      setCurrentView('feed');
      if (region) setFilterRegion(decodeURIComponent(region));
    } else if (path === '/plan-maker') {
      setCurrentView('plan-maker');
    } else if (path === '/create-post') {
      setCurrentView('create');
    } else if (path === '/') {
      setCurrentView('feed');
      setFilterRegion('전체');
    }
  }, [location.pathname, category, id, region, userId]);

  const handleViewChange = (view: 'feed' | 'detail' | 'create' | 'feed-edit' | 'mypage' | 'board-list' | 'plan-maker' | 'community-create' | 'community-edit' | 'community' | 'social', data?: any) => {
    // view가 'community'인 경우 바로 'board-list'로 상태를 설정하여 이전 뷰가 보이는 현상 방지
    const targetView = (view === 'community' ? 'board-list' : view) as 'feed' | 'detail' | 'create' | 'feed-edit' | 'mypage' | 'board-list' | 'plan-maker' | 'community-create' | 'community-edit' | 'social';
    setCurrentView(targetView);
    window.scrollTo(0, 0);
    
    // URL 업데이트
    if (view === 'mypage') {
      setPendingUserId(data?.userId ? String(data.userId) : null);
      if (data?.userId) navigate(`/mypage/${data.userId}`);
      else navigate('/mypage');
    }
    else if (view === 'social') {
      navigate('/social');
    }
    else if (view === 'community') {
      setBoardType('free');
      navigate('/community/free');
    }
    else if (view === 'plan-maker') navigate('/plan-maker');
    else if (view === 'create') navigate('/create-post');
    else if (view === 'feed') {
      if (data?.region && data.region !== '전체') navigate(`/feed/${data.region}`);
      else navigate('/');
    }
    else if (view === 'community-create') {
      const type = data?.boardType || boardType;
      navigate(`/community/create/${type}`);
    }
    else if (view === 'feed-edit' && data?.post) {
      navigate(`/travel/edit/${data.post.id}`);
    }
    else if (view === 'community-edit' && data?.post) {
      const type = data.post.category || boardType;
      navigate(`/community/edit/${type}/${data.post.id}`);
    }
    else if (view === 'board-list') {
      const type = data?.boardType || boardType;
      navigate(`/community/${type}`);
    }
    else if (view === 'detail' && data?.post) {
      setSelectedPost(data.post);
      if (data.post.category === 'recommend') {
        navigate(`/community/recommend/${data.post.id}`);
      } else if (data.post.category && data.post.category !== 'feed') {
        // 커뮤니티 게시글
        navigate(`/community/${data.post.category}/${data.post.id}`);
      } else {
        // 여행 피드 게시글 (category === 'feed' 또는 미지정)
        navigate(`/travel/${data.post.id}`);
      }
    }
    else if ((view as any) === 'recommend-detail' && data?.post) {
      setSelectedPost(data.post);
      navigate(`/community/recommend/${data.post.id}`);
    }
    
    if (data?.post) setSelectedPost(data.post);
    if (data?.boardType) setBoardType(data.boardType);
    if (data?.region) setFilterRegion(data.region);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar 
        currentView={currentView === 'board-list' ? 'community' : (currentView === 'plan-maker' ? 'plan-maker' : currentView)} 
        onNavigate={handleViewChange}
      />
      
      <main className="w-full">
        {currentView === 'feed' && (
          <MainFeed 
            initialRegion={filterRegion}
            onNavigate={handleViewChange} 
          />
        )}
        {currentView === 'board-list' && (
          <BoardList 
            type={boardType}
            onBack={() => handleViewChange('feed')}
            onNavigate={handleViewChange}
          />
        )}
        {currentView === 'recommend-detail' && (
          <RecommendDetail
            post={selectedPost}
            postId={id}
            onBack={() => handleViewChange('board-list', { boardType: 'recommend' })}
            onNavigate={handleViewChange}
          />
        )}
        {/* 커뮤니티 게시글 상세 (자유/QnA/메이트) — 딥링크 안전 (URL id로 직접 조회) */}
        {currentView === 'detail' && category && id && ['free', 'qna', 'mate'].includes(category) && (
          <CommunityPostDetail
            postId={id}
            onBack={() => handleViewChange('board-list', { boardType: category as any })}
            onNavigate={handleViewChange}
          />
        )}
        {/* 여행 피드 상세 — 딥링크 안전 (URL id로 직접 조회) */}
        {currentView === 'detail' && !(category && id && ['free', 'qna', 'mate'].includes(category)) && id && (
          <PostDetail
            postId={id}
            onBack={() => navigate(-1)}
            onNavigate={handleViewChange}
          />
        )}
        {currentView === 'create' && (
          <CreatePost 
            onBack={() => handleViewChange('feed')}
            onSubmit={() => handleViewChange('feed')}
          />
        )}
        {/* 여행기 수정 — 작성 화면을 수정 모드로 재사용 */}
        {currentView === 'feed-edit' && id && (
          <CreatePost
            editPostId={id}
            onBack={() => navigate(`/travel/${id}`)}
            onSubmit={() => handleViewChange('detail', { post: { id, category: 'feed' } })}
          />
        )}
        {currentView === 'mypage' && (
          // key로 사용자마다 새 인스턴스를 만든다 — 내 마이페이지 → 상대 마이페이지처럼
          // 같은 컴포넌트가 유지되면 이전 사용자의 프로필 state가 남아 그대로 보인다.
          <MyPage
            key={activeProfileUserId ?? 'me'}
            onNavigate={handleViewChange}
            onOpenChat={handleGlobalChat}
            userId={activeProfileUserId}
          />
        )}
        {currentView === 'social' && (
          <SocialPage 
            onOpenChat={handleGlobalChat} 
            onNavigate={handleViewChange}
          />
        )}
        {currentView === 'community-create' && (
          <CommunityCreate 
            type={boardType}
            onBack={() => handleViewChange('board-list', { boardType })}
            onSubmit={() => handleViewChange('board-list', { boardType })}
          />
        )}
        {currentView === 'community-edit' && id && (
          <CommunityCreate
            type={boardType}
            editPostId={id}
            onBack={() => handleViewChange('detail', { post: { id, category: boardType } })}
            onSubmit={() => handleViewChange('detail', { post: { id, category: boardType } })}
          />
        )}
        {currentView === 'plan-maker' && (
          <Home hideNavbar={true} />
        )}
      </main>

      <ChatModal 
        isOpen={isChatModalOpen} 
        onClose={() => {
          setIsChatModalOpen(false);
          setSelectedChatUser(null);
        }} 
        otherUser={selectedChatUser} 
      />
    </div>
  );
}
