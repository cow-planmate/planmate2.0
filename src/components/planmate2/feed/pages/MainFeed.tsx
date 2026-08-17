import { useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useApiClient } from '../../../../hooks/useApiClient';
import useKakaoLoader from '../../../../hooks/useKakaoLoader';
import { mapFeedPost, reactToPost } from '../../community/api/communityApi';
import { useFeedPosts, useFeedRegionCounts } from '../../community/hooks/queries';
import { useMainFeedFilters } from '../hooks/useMainFeedLogic';
import { useRegionMarkers } from '../hooks/useRegionMarkers';
import { DEFAULT_MAP_CENTER, FEED_REGIONS, getRegionCoords } from '../utils/region';
import { PostCardSkeleton } from '../molecules/PostCardSkeleton';
import { SearchBar } from '../molecules/SearchBar';
import { DetailFilterPanel } from '../organisms/DetailFilterPanel';
import { FeedQuickFilters } from '../organisms/FeedQuickFilters';
import { MainFeedHeader } from '../organisms/MainFeedHeader';
import { MainFeedSidebar } from '../organisms/MainFeedSidebar';
import { MainPostsGrid } from '../organisms/MainPostsGrid';

interface MainFeedProps {
  initialRegion?: string;
  onNavigate: (view: any, data?: any) => void;
}

export default function MainFeed({ initialRegion = '전체', onNavigate }: MainFeedProps) {
  useKakaoLoader();
  const { isAuthenticated } = useApiClient();
  const queryClient = useQueryClient();
  const { filters, setters, serverParams } = useMainFeedFilters(initialRegion, onNavigate);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useFeedPosts(serverParams);
  const { data: regionCountList } = useFeedRegionCounts();

  const posts = useMemo(
    () => (data?.pages ?? []).flatMap(page => page.items.map(mapFeedPost)),
    [data],
  );
  // 게시글이 있는 모든 여행지를 지도에 표시 (좌표 미상 지역은 지오코딩으로 보완)
  const regionMarkers = useRegionMarkers(regionCountList);

  // 모바일은 그리드 카드 하나가 화면을 거의 다 먹어 한 번에 한 건밖에 안 보인다 —
  // 좁은 화면에서는 리스트로 시작한다. 첫 렌더에서만 정하므로 사용자가 토글하면 그 선택이 유지된다.
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    () => (typeof window !== 'undefined' && window.innerWidth < 640 ? 'list' : 'grid'),
  );
  // 눌림 표시는 세션 로컬 (목록 요약에는 myReaction이 없음) — 카운트는 서버 값 그대로 표시
  // 비추천은 목록에서 아예 노출하지 않는다(상세에서만) — 훑어보다 누르는 버튼이 되면 안 된다
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [mapState, setMapState] = useState({
    center: DEFAULT_MAP_CENTER,
    level: 14
  });

  const durations = ['전체', '1일', '2-3일', '4일 이상'];
  const sortOptions = ['최신순', '인기순', '좋아요순', '가져가기순'];

  // 필터 지역 목록은 광역자치단체 전체를 항상 노출한다 — 게시글이 있는 지역만 보여주면
  // "서울·경기 글밖에 없으면 서울·경기만 고를 수 있는" 상태가 되어 필터 구실을 못 한다.
  // 여기에 없는 지역(시/군 단위 등)이 서버 집계에 잡히면 뒤에 덧붙인다.
  const regions = useMemo(() => {
    const fromServer = (regionCountList ?? []).filter(rc => rc.count > 0).map(rc => rc.region);
    const extras = fromServer.filter(name => !FEED_REGIONS.includes(name));
    // 선택 중인 지역은 목록에 없더라도 항상 포함 (URL로 직접 들어온 경우)
    if (filters.selectedRegion !== '전체'
      && !FEED_REGIONS.includes(filters.selectedRegion)
      && !extras.includes(filters.selectedRegion)) {
      extras.push(filters.selectedRegion);
    }
    return ['전체', ...FEED_REGIONS, ...extras];
  }, [regionCountList, filters.selectedRegion]);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (filters.searchQuery) {
      chips.push({ key: 'q', label: `"${filters.searchQuery}"`, onRemove: () => setters.setSearchQuery('') });
    }
    if (filters.selectedRegion !== '전체') {
      chips.push({ key: 'region', label: filters.selectedRegion, onRemove: () => setters.handleRegionSelect(filters.selectedRegion) });
    }
    if (filters.selectedDuration !== '전체') {
      chips.push({ key: 'duration', label: filters.selectedDuration, onRemove: () => setters.setSelectedDuration('전체') });
    }
    if (filters.sortOrder !== 'desc') {
      chips.push({ key: 'order', label: '오름차순', onRemove: () => setters.setSortOrder('desc') });
    }
    return chips;
  }, [filters.searchQuery, filters.selectedRegion, filters.selectedDuration, filters.sortOrder, setters]);

  useEffect(() => {
    if (filters.selectedRegion === '전체') {
      setMapState({ center: DEFAULT_MAP_CENTER, level: 14 });
      return;
    }
    const coords = getRegionCoords(filters.selectedRegion)
      ?? regionMarkers.find(marker => marker.name === filters.selectedRegion);
    if (coords) {
      setMapState({ center: { lat: coords.lat, lng: coords.lng }, level: 11 });
    }
  }, [filters.selectedRegion, regionMarkers]);

  const react = async (postId: number, type: 'like' | 'dislike') => {
    try {
      await reactToPost(postId, type);
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
    } catch (error) {
      alert(`반응 처리에 실패했습니다: ${(error as Error).message}`);
    }
  };

  const handleLike = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.');
      return;
    }
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
    react(postId, 'like');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MainFeedHeader
        onNavigate={onNavigate}
        isAuthenticated={isAuthenticated()}
      />

      {/* 검색 & 필터 바 */}
      {/* 모바일에서는 검색창이 한 줄을 다 쓰고, 토글·필터가 그 아래로 내려간다.
          한 줄에 몰아넣으면 폭이 모자라 버튼 글자가 두 줄로 쪼개진다. */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <SearchBar
              value={filters.searchQuery}
              onChange={setters.setSearchQuery}
              placeholder="제목, 지역, 작성자로 검색..."
            />
          </div>

          <div className="flex gap-3">
            {/* 뷰 모드 토글 (그리드 / 리스트) */}
            <div className="flex flex-1 sm:flex-none bg-white rounded-xl border border-[#e5e7eb] p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all font-bold text-sm whitespace-nowrap ${viewMode === 'grid'
                    ? 'bg-blue-50 text-[#1344FF]'
                    : 'text-[#666666] hover:bg-gray-50'
                  }`}
              >
                <LayoutGrid className="w-4 h-4 shrink-0" />
                <span>그리드</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all font-bold text-sm whitespace-nowrap ${viewMode === 'list'
                    ? 'bg-blue-50 text-[#1344FF]'
                    : 'text-[#666666] hover:bg-gray-50'
                  }`}
              >
                <List className="w-4 h-4 shrink-0" />
                <span>리스트</span>
              </button>
            </div>

            <button
              onClick={() => setters.setShowFilters(!filters.showFilters)}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl border transition-all font-medium whitespace-nowrap ${filters.showFilters || filters.activeFilterCount > 0
                ? 'bg-[#1344FF] text-white border-[#1344FF] shadow-md'
                : 'bg-white text-[#666666] border-[#e5e7eb] hover:border-[#1344FF]'
                }`}
            >
              <SlidersHorizontal className="w-5 h-5 shrink-0" />
              <span>필터</span>
              {filters.activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 shrink-0 bg-white text-[#1344FF] rounded-full text-xs font-bold">
                  {filters.activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {filters.showFilters && (
        <DetailFilterPanel
          onClear={setters.clearFilters}
          regions={regions}
          durations={durations}
          sortOptions={sortOptions}
          selectedRegion={filters.selectedRegion}
          selectedDuration={filters.selectedDuration}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onRegionChange={setters.setSelectedRegion}
          onDurationChange={setters.setSelectedDuration}
          onSortChange={setters.setSortBy}
          onSortOrderChange={setters.setSortOrder}
        />
      )}

      <FeedQuickFilters
        activeChips={activeChips}
        onClearAll={setters.clearFilters}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isLoading ? (
            <PostCardSkeleton viewMode={viewMode} />
          ) : (
            <>
              <MainPostsGrid
                posts={posts}
                viewMode={viewMode}
                onNavigate={onNavigate}
                likedPosts={likedPosts}
                onLike={handleLike}
                onClearFilters={setters.clearFilters}
              />
              {hasNextPage && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="px-8 py-3 bg-white border border-[#ececf0] rounded-xl text-[#1344FF] font-bold hover:border-[#1344FF] transition-all disabled:opacity-50"
                  >
                    {isFetchingNextPage ? '불러오는 중...' : '더 보기'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <MainFeedSidebar
          mapState={mapState}
          onRegionSelect={setters.handleRegionSelect}
          selectedRegion={filters.selectedRegion}
          onNavigate={onNavigate}
          regionMarkers={regionMarkers}
          isAuthenticated={isAuthenticated()}
        />
      </div>
    </div>
  );
};
