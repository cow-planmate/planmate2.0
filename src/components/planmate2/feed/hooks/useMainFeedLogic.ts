import { useEffect, useMemo, useState } from 'react';

interface FilterState {
  selectedRegion: string;
  selectedDuration: string;
  sortBy: string;
  selectedTag: string | null;
  searchQuery: string;
}

export const useMainFeedFilters = (allPosts: any[], initialRegion: string, onNavigate: (view: any, data?: any) => void) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [selectedDuration, setSelectedDuration] = useState<string>('전체');
  const [sortBy, setSortBy] = useState<string>('최신순');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (initialRegion) {
      setSelectedRegion(initialRegion);
    }
  }, [initialRegion]);

  const filteredPosts = useMemo(() => {
    let result = [...allPosts];

    if (selectedTag) {
      result = result.filter(post => post.tags.includes(selectedTag));
    }

    if (selectedRegion !== '전체') {
      result = result.filter(post => post.destination === selectedRegion);
    }

    if (selectedDuration !== '전체') {
      result = result.filter(post => {
        if (selectedDuration === '1일') return post.duration.includes('1일');
        if (selectedDuration === '2-3일') return post.duration.includes('2박') || post.duration.includes('3박');
        if (selectedDuration === '4일 이상') return post.duration.includes('4박') || post.duration.includes('5박');
        return true;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.destination.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q)
      );
    }

    if (sortBy === '인기순' || sortBy === '가져가기순') {
      result.sort((a, b) => b.forks - a.forks);
    } else if (sortBy === '좋아요순') {
      result.sort((a, b) => b.likes - a.likes);
    }

    return result;
  }, [allPosts, selectedTag, selectedRegion, selectedDuration, searchQuery, sortBy]);

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
    filteredPosts
  };
};
