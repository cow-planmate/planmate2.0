import { useQueryClient } from '@tanstack/react-query';
import { Plus, SlidersHorizontal } from 'lucide-react';
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

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } = useFeedPosts(serverParams);
  const { data: regionCountList } = useFeedRegionCounts();

  const posts = useMemo(
    () => (data?.pages ?? []).flatMap(page => page.items.map(mapFeedPost)),
    [data],
  );
  // 게시글이 있는 모든 여행지를 지도에 표시 (좌표 미상 지역은 지오코딩으로 보완)
  const regionMarkers = useRegionMarkers(regionCountList);

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

  const handleWrite = () => {
    if (!isAuthenticated()) {
      alert('로그인 후 여행기를 작성할 수 있습니다.');
      return;
    }
    onNavigate('create');
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#f4f5f7] px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto grid max-w-[1450px] grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-10">
        <section className="min-w-0 overflow-hidden rounded-[18px] border border-[#d9dce2] bg-white">
          <div className="px-4 pt-4 sm:px-6 sm:pt-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="min-w-0 flex-1 [&_input]:min-h-14 [&_input]:rounded-xl">
                <SearchBar
                  value={filters.searchQuery}
                  onChange={setters.setSearchQuery}
                  placeholder="제목, 지역, 작성자로 검색"
                />
              </div>
              <button
                type="button"
                onClick={() => setters.setShowFilters(!filters.showFilters)}
                aria-expanded={filters.showFilters}
                className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border px-5 text-[15px] font-bold transition-colors ${filters.showFilters || filters.activeFilterCount > 0
                  ? 'border-[#1344FF] bg-[#1344FF] text-white'
                  : 'border-[#d9dce2] bg-white text-[#252830] hover:border-[#1344FF] hover:text-[#1344FF]'}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                상세 필터
                {filters.activeFilterCount > 0 && <span>({filters.activeFilterCount})</span>}
              </button>
            </div>

            <div className="mt-3 flex items-center gap-6 border-b border-[#dfe1e6]">
              {['최신순', '인기순', '가져가기순'].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setters.setSortBy(option)}
                  className={`border-b-2 px-0.5 py-3 text-[15px] font-bold transition-colors ${filters.sortBy === option
                    ? 'border-[#111318] text-[#111318]'
                    : 'border-transparent text-[#a2a7b0] hover:text-[#1344FF]'}`}
                >
                  {option === '가져가기순' ? '가져간 순' : option}
                </button>
              ))}
            </div>
          </div>

          {filters.showFilters && (
            <div className="px-4 pt-4 sm:px-6">
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
            </div>
          )}

          {error && (
            <div className="m-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
              여행기를 불러오지 못했습니다: {(error as Error).message}
            </div>
          )}

          {isLoading ? (
            <div className="p-5"><PostCardSkeleton viewMode="list" /></div>
          ) : (
            <>
              <MainPostsGrid
                posts={posts}
                viewMode="list"
                onNavigate={onNavigate}
                likedPosts={likedPosts}
                onLike={handleLike}
                onClearFilters={setters.clearFilters}
              />
              {hasNextPage && (
                <div className="border-t border-[#e5e7eb] p-6 text-center">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="rounded-xl border border-[#d9dce2] bg-white px-8 py-3 font-bold text-[#1344FF] transition-colors hover:border-[#1344FF] disabled:opacity-50"
                  >
                    {isFetchingNextPage ? '불러오는 중...' : '더 보기'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="min-w-0">
          <MainFeedSidebar
            mapState={mapState}
            onRegionSelect={setters.handleRegionSelect}
            selectedRegion={filters.selectedRegion}
            onNavigate={onNavigate}
            regionMarkers={regionMarkers}
            isAuthenticated={isAuthenticated()}
          />
        </aside>
      </div>

      <button
        type="button"
        onClick={handleWrite}
        className="fixed bottom-6 right-4 z-40 flex min-h-14 items-center gap-2 rounded-full bg-[#1344FF] px-6 text-base font-extrabold text-white shadow-[0_12px_30px_rgba(19,68,255,0.28)] transition-transform hover:-translate-y-0.5 hover:bg-[#0d34cc] sm:bottom-8 sm:right-8"
      >
        <Plus className="h-5 w-5" /> 여행기 쓰기
      </button>
    </div>
  );
};
