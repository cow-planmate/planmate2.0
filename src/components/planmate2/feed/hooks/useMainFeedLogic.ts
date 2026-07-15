import { useEffect, useMemo, useState } from 'react';
import type { FeedFilterParams } from '../../community/api/communityApi';

/** UI 라벨 → 서버 정렬 키 (인기순=조회수, 가져가기순=포크) */
const SORT_MAP: Record<string, string> = {
  '최신순': 'latest',
  '인기순': 'views',
  '좋아요순': 'likes',
  '가져가기순': 'forks',
};

/** UI 기간 버킷 → minDays/maxDays 범위 */
const DURATION_MAP: Record<string, { minDays?: number; maxDays?: number }> = {
  '1일': { minDays: 1, maxDays: 1 },
  '2-3일': { minDays: 2, maxDays: 3 },
  '4일 이상': { minDays: 4 },
};

export const useMainFeedFilters = (initialRegion: string, onNavigate: (view: any, data?: any) => void) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [selectedDuration, setSelectedDuration] = useState<string>('전체');
  const [sortBy, setSortBy] = useState<string>('최신순');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (initialRegion) {
      setSelectedRegion(initialRegion);
    }
  }, [initialRegion]);

  // 검색어 디바운스 (~400ms) — 타이핑마다 요청하지 않도록
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 서버사이드 필터 파라미터 (필터링/정렬은 백엔드가 수행)
  const serverParams: FeedFilterParams = useMemo(() => ({
    region: selectedRegion !== '전체' ? selectedRegion : undefined,
    ...(DURATION_MAP[selectedDuration] ?? {}),
    tag: selectedTag ?? undefined,
    sort: SORT_MAP[sortBy] ?? 'latest',
    q: debouncedQuery.trim() || undefined,
  }), [selectedRegion, selectedDuration, selectedTag, sortBy, debouncedQuery]);

  const activeFilterCount = useMemo(() => {
    return (selectedRegion !== '전체' ? 1 : 0) +
           (selectedDuration !== '전체' ? 1 : 0) +
           (sortBy !== '최신순' ? 1 : 0) +
           (selectedTag ? 1 : 0);
  }, [selectedRegion, selectedDuration, sortBy, selectedTag]);

  const clearFilters = () => {
    setSelectedRegion('전체');
    onNavigate('feed', { region: '전체' });
    setSelectedDuration('전체');
    setSortBy('최신순');
    setSelectedTag(null);
    setSearchQuery('');
  };

  const handleRegionSelect = (regionName: string) => {
    if (selectedRegion === regionName) {
      setSelectedRegion('전체');
      onNavigate('feed', { region: '전체' });
    } else {
      setSelectedRegion(regionName);
      onNavigate('feed', { region: regionName });
    }
  };

  return {
    filters: {
      selectedRegion,
      selectedDuration,
      sortBy,
      selectedTag,
      searchQuery,
      showFilters,
      activeFilterCount
    },
    setters: {
      setSelectedRegion,
      setSelectedDuration,
      setSortBy,
      setSelectedTag,
      setSearchQuery,
      setShowFilters,
      clearFilters,
      handleRegionSelect
    },
    serverParams
  };
};
