import { useEffect, useState } from 'react';
import { ViewToggle } from '../../feed/atoms/ViewToggle';
import { FeedMapView } from '../../feed/organisms/FeedMapView';
import { useHotPosts, usePosts } from '../hooks/queries';
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
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // 검색어 디바운스 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 게시판 전환 시 초기화
  useEffect(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    setPage(0);
  }, [type]);

  const { data: postsPage, isLoading, error } = usePosts(type, page, 'latest', debouncedQuery);
  const { data: hotPosts } = useHotPosts(type);

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

  const posts = postsPage?.items ?? [];

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

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-500 rounded-xl p-4 mb-4 text-sm font-medium">
          게시글을 불러오지 못했습니다: {(error as Error).message}
        </div>
      )}

      {viewMode === 'grid' ? (
        <>
          <HotPostsGrid
            hotPosts={hotPosts ?? []}
            type={type}
            onNavigate={onNavigate}
          />

          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 font-medium">
              게시글을 불러오는 중...
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 font-medium">
              {debouncedQuery ? '검색 결과가 없습니다.' : '아직 게시글이 없어요. 첫 글을 작성해보세요!'}
            </div>
          ) : (
            <PostListTable
              posts={posts}
              type={type}
              onNavigate={onNavigate}
              page={postsPage?.page ?? 0}
              totalPages={postsPage?.totalPages ?? 1}
              onPageChange={setPage}
            />
          )}
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
