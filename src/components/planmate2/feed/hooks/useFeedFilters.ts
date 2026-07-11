import { useMemo, useState } from 'react';
import { TravelPost } from '../../../../types/planmate2';

export const useFeedFilters = (allPosts: TravelPost[]) => {
  const [selectedTag, setSelectedTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesTag = selectedTag === 'all' || post.tags.includes(selectedTag);
      const matchesSearch =
        searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTag && matchesSearch;
    });
  }, [allPosts, selectedTag, searchQuery]);

  return {
    selectedTag,
    setSelectedTag,
    searchQuery,
    setSearchQuery,
    filteredPosts
  };
};
