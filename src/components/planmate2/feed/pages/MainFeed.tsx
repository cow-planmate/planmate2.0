import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MAIN_FEED_MOCK_POSTS } from '../../../../data/mainFeedMockData';
import { useApiClient } from '../../../../hooks/useApiClient';
import useKakaoLoader from '../../../../hooks/useKakaoLoader';
import { useMainFeedFilters } from '../hooks/useMainFeedLogic';
import { SearchBar } from '../molecules/SearchBar';
import { DetailFilterPanel } from '../organisms/DetailFilterPanel';
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
  const { filters, setters, filteredPosts } = useMainFeedFilters(MAIN_FEED_MOCK_POSTS, initialRegion, onNavigate);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [dislikedPosts, setDislikedPosts] = useState<Set<number>>(new Set());
  const [mapState, setMapState] = useState({
    center: { lat: 35.95, lng: 128.25 },
    level: 14
  });

  const tags = ['#뚜벅이최적화', '#극한의J', '#여유로운P', '#동선낭비없는'];
  const regions = ['전체', '서울', '부산', '제주도', '강릉', '경주', '전주'];
  const durations = ['전체', '1일', '2-3일', '4일 이상'];
  const sortOptions = ['최신순', '인기순', '좋아요순', '가져가기순'];

  useEffect(() => {
    const coords: Record<string, any> = {
      '서울': { lat: 37.5665, lng: 126.9780 },
      '부산': { lat: 35.1796, lng: 129.0756 },
      '제주도': { lat: 33.4996, lng: 126.5312 },
      '전체': { lat: 35.95, lng: 128.25 }
    };
    if (coords[filters.selectedRegion]) {
      setMapState({
        center: coords[filters.selectedRegion],
        level: filters.selectedRegion === '전체' ? 14 : 11
      });
    }
  }, [filters.selectedRegion]);

  const handleLike = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (dislikedPosts.has(postId)) {
      setDislikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
  };

  const handleDislike = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedPosts.has(postId)) {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
    setDislikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MainFeedHeader
        onNavigate={onNavigate}
        isAuthenticated={isAuthenticated()}
      />

      {/* 검색 & 필터 바 */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <SearchBar
              value={filters.searchQuery}
              onChange={setters.setSearchQuery}
              placeholder="제목, 지역, 작성자로 검색..."
            />
          </div>

          {/* 뷰 모드 토글 (그리드 / 리스트) */}
          <div className="flex bg-white rounded-xl border border-[#e5e7eb] p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-sm ${viewMode === 'grid'
                  ? 'bg-blue-50 text-[#1344FF]'
                  : 'text-[#666666] hover:bg-gray-50'
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>그리드</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-sm ${viewMode === 'list'
                  ? 'bg-blue-50 text-[#1344FF]'
                  : 'text-[#666666] hover:bg-gray-50'
                }`}
            >
              <List className="w-4 h-4" />
              <span>리스트</span>
            </button>
          </div>

          <button
            onClick={() => setters.setShowFilters(!filters.showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all font-medium ${filters.showFilters || filters.activeFilterCount > 0
              ? 'bg-[#1344FF] text-white border-[#1344FF] shadow-md'
              : 'bg-white text-[#666666] border-[#e5e7eb] hover:border-[#1344FF]'
              }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>필터</span>
            {filters.activeFilterCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 bg-white text-[#1344FF] rounded-full text-xs font-bold">
                {filters.activeFilterCount}
              </span>
            )}
          </button>
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
          onRegionChange={setters.setSelectedRegion}
          onDurationChange={setters.setSelectedDuration}
          onSortChange={setters.setSortBy}
        />
      )}

      {/* 태그 필터 */}
      <div className="mb-8 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3">
          <button
            onClick={() => setters.setSelectedTag(null)}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${filters.selectedTag === null
              ? 'bg-[#1344FF] text-white shadow-md'
              : 'bg-white text-[#666666] border border-[#e5e7eb] hover:border-[#1344FF]'
              }`}
          >
            전체
          </button>
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setters.setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${filters.selectedTag === tag
                ? 'bg-[#1344FF] text-white shadow-md'
                : 'bg-white text-[#666666] border border-[#e5e7eb] hover:border-[#1344FF]'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {(filters.searchQuery || filters.activeFilterCount > 0) && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[#666666]">
            <span className="font-bold text-[#1344FF]">{filteredPosts.length}개</span>의 여행기를 찾았습니다
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MainPostsGrid
            posts={filteredPosts}
            viewMode={viewMode}
            onNavigate={onNavigate}
            likedPosts={likedPosts}
            dislikedPosts={dislikedPosts}
            onLike={handleLike}
            onDislike={handleDislike}
            onClearFilters={setters.clearFilters}
          />
        </div>

        <MainFeedSidebar
          mapState={mapState}
          onRegionSelect={setters.handleRegionSelect}
          selectedRegion={filters.selectedRegion}
          onNavigate={onNavigate}
          posts={MAIN_FEED_MOCK_POSTS}
        />
      </div>
    </div>
  );
};
