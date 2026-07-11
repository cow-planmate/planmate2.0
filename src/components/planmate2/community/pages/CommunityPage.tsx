import { useState } from 'react';
import { MOCK_POSTS } from '../constants/mockData';
import { ViewToggle } from '../../feed/atoms/ViewToggle';
import { FeedMapView } from '../../feed/organisms/FeedMapView';
import { SearchBar } from '../molecules/SearchBar';
import { BoardHeader } from '../organisms/BoardHeader';
import { HotPostsGrid } from '../organisms/HotPostsGrid';
import { NavigationTabs } from '../organisms/NavigationTabs';
import { PostListTable } from '../organisms/PostListTable';

interface CommunityPageProps {
  type: 'free' | 'qna' | 'mate' | 'recommend';
  onBack: () => void;
  onNavigate: (view: any, data?: any) => void;
}

export const CommunityPage = ({ type, onBack, onNavigate }: CommunityPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const getTitle = () => {
    switch (type) {
      case 'free': return '자유게시판';
      case 'qna': return 'Q&A';
      case 'mate': return '메이트 찾기';
      case 'recommend': return '장소 추천';
      default: return '게시판';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'free': return '자유롭게 여행 이야기를 나눠요';
      case 'qna': return '궁금한 점을 물어보세요';
      case 'mate': return '함께 여행할 동료를 찾아요';
      case 'recommend': return '나만 알고 싶은 숨은 명소를 공유해요';
      default: return '';
    }
  };

  const posts = MOCK_POSTS[type] || [];
  const hotPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 3);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      <BoardHeader 
        type={type}
        title={getTitle()}
        description={getDescription()}
        onBack={onBack}
      />

      <NavigationTabs 
        currentType={type}
        onNavigate={onNavigate}
      />

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
        <div className="flex-1 w-full">
          <SearchBar 
            title={getTitle()}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onWriteClick={() => onNavigate('community-create')}
          />
        </div>
        {type === 'recommend' && (
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        )}
      </div>

      {viewMode === 'grid' ? (
        <>
          <HotPostsGrid 
            hotPosts={hotPosts}
            type={type}
            onNavigate={onNavigate}
          />

          <PostListTable 
            posts={posts}
            type={type}
            onNavigate={onNavigate}
          />
        </>
      ) : (
        <div className="mt-6">
          <FeedMapView 
            posts={posts}
            mapState={{ center: { lat: 35.95, lng: 128.25 }, level: 13 }}
            onNavigate={onNavigate}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

