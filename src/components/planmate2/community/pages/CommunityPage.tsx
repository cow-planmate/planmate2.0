import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useApiClient } from '../../../../hooks/useApiClient';
import { useHotPosts, usePosts } from '../hooks/queries';
import { SearchBar } from '../molecules/SearchBar';
import { HotPostsGrid } from '../organisms/HotPostsGrid';
import { NavigationTabs } from '../organisms/NavigationTabs';
import { PostListTable } from '../organisms/PostListTable';

interface CommunityPageProps {
  type: 'free' | 'qna' | 'recommend';
  onNavigate: (view: any, data?: any) => void;
}

// 백엔드 SortType과 1:1 (forks는 피드 전용이라 게시판에서는 노출하지 않는다)
type SortOption = 'latest' | 'likes' | 'views';

const SORT_LABELS: { value: SortOption; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'likes', label: '추천순' },
  { value: 'views', label: '조회순' },
];

export const CommunityPage = ({ type, onNavigate }: CommunityPageProps) => {
  const { isAuthenticated } = useApiClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortOption>('latest');

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
    setSort('latest');
  }, [type]);

  const { data: postsPage, isLoading, error } = usePosts(type, page, sort, debouncedQuery);
  const { data: hotPosts } = useHotPosts(type);

  const getTitle = () => {
    switch (type) {
      case 'free': return '자유게시판';
      case 'qna': return '질문게시판';
      case 'recommend': return '장소 추천';
      default: return '게시판';
    }
  };

  const posts = postsPage?.items ?? [];

  const handleWrite = () => {
    if (!isAuthenticated()) {
      alert('로그인 후 글을 작성할 수 있습니다.');
      return;
    }
    onNavigate('community-create');
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#f4f5f7] px-3 py-7 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[1450px]">
        <NavigationTabs currentType={type} onNavigate={onNavigate} />

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-500 rounded-xl p-4 mb-4 text-sm font-medium">
          게시글을 불러오지 못했습니다: {(error as Error).message}
        </div>
      )}

        <HotPostsGrid hotPosts={hotPosts ?? []} type={type} onNavigate={onNavigate} />

        <section className="overflow-hidden rounded-[18px] border border-[#d9dce2] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#dfe1e6] p-4 sm:flex-row sm:items-center sm:p-6">
            <div className="min-w-0 flex-1">
              <SearchBar
                title={getTitle()}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
            <div className="flex min-h-14 shrink-0 rounded-xl bg-[#f1f1f3] p-1" aria-label="게시글 정렬">
              {SORT_LABELS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setSort(value); setPage(0); }}
                  className={`flex min-h-12 flex-1 items-center justify-center whitespace-nowrap rounded-lg px-4 text-sm font-bold transition-all sm:flex-none ${sort === value
                    ? 'bg-white text-[#1344FF] shadow-sm'
                    : 'text-[#454a55] hover:text-[#1344FF]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center font-medium text-gray-400">
              게시글을 불러오는 중...
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center font-medium text-gray-400">
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
              embedded
            />
          )}
        </section>
      </div>

      <button
        type="button"
        onClick={handleWrite}
        className="fixed bottom-6 right-4 z-40 flex min-h-14 items-center gap-2 rounded-full bg-[#1344FF] px-6 text-base font-extrabold text-white shadow-[0_12px_30px_rgba(19,68,255,0.28)] transition-transform hover:-translate-y-0.5 hover:bg-[#0d34cc] sm:bottom-8 sm:right-8"
      >
        <Plus className="h-5 w-5" /> 글쓰기
      </button>
    </div>
  );
};
