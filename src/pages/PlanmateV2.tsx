import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CommunityCreatePage as CommunityCreate } from '../components/planmate2/community/pages/CommunityCreatePage';
import { CommunityPage as BoardList } from '../components/planmate2/community/pages/CommunityPage';
import { RecommendDetailPage as RecommendDetail } from '../components/planmate2/community/pages/RecommendDetailPage';
import CreatePost from '../components/planmate2/create-feed/pages/CreatePostPage';
import PostDetail from '../components/planmate2/feed/pages/FeedDetailPage';
import MainFeed from '../components/planmate2/feed/pages/MainFeed';
import MyPage from '../components/planmate2/mypage/pages/my-page';
import Navbar from '../components/planmate2/navbar';
import { ChatModal } from '../components/planmate2/social/molecules/ChatModal';
import { SocialPage } from '../components/planmate2/social/pages/SocialPage';
import Home from './Home';

export default function PlanmateV2() {
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
      if (path.split('/').length > 3) return 'detail'; // /community/category/id
      return 'board-list';
    }
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

  const [currentView, setCurrentView] = useState<'feed' | 'detail' | 'create' | 'mypage' | 'board-list' | 'plan-maker' | 'community-create' | 'recommend-detail' | 'social'>(getInitialView() as any);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [boardType, setBoardType] = useState<'free' | 'qna' | 'mate' | 'recommend'>('free');
  const [filterRegion, setFilterRegion] = useState<string>(region ? decodeURIComponent(region) : '전체');

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
    } else if (path === '/social') {
      setCurrentView('social');
    } else if (path.startsWith('/community')) {
      if (path === '/community/create' || path.startsWith('/community/create/')) {
        setCurrentView('community-create');
        const typeFromPath = path.split('/')[3];
        if (typeFromPath && ['free', 'qna', 'mate', 'recommend'].includes(typeFromPath)) {
          setBoardType(typeFromPath as any);
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

  const handleViewChange = (view: 'feed' | 'detail' | 'create' | 'mypage' | 'board-list' | 'plan-maker' | 'community-create' | 'community' | 'social', data?: any) => {
    // view가 'community'인 경우 바로 'board-list'로 상태를 설정하여 이전 뷰가 보이는 현상 방지
    const targetView = (view === 'community' ? 'board-list' : view) as 'feed' | 'detail' | 'create' | 'mypage' | 'board-list' | 'plan-maker' | 'community-create' | 'social';
    setCurrentView(targetView);
    window.scrollTo(0, 0);
    
    // URL 업데이트
    if (view === 'mypage') {
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
    else if (view === 'board-list') {
      const type = data?.boardType || boardType;
      navigate(`/community/${type}`);
    }
    else if (view === 'detail' && data?.post) {
      setSelectedPost(data.post);
      if (data.post.category === 'recommend') {
        navigate(`/community/recommend/${data.post.id}`);
      } else if (data.post.category) {
        // 커뮤니티 게시글
        navigate(`/community/${data.post.category}/${data.post.id}`);
      } else {
        // 여행 피드 게시글
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
            onBack={() => handleViewChange('board-list', { boardType: 'recommend' })}
            onNavigate={handleViewChange}
          />
        )}
        {currentView === 'detail' && selectedPost && (
          <PostDetail 
            post={selectedPost} 
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
        {currentView === 'mypage' && (
          <MyPage onNavigate={handleViewChange} userId={userId} />
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
