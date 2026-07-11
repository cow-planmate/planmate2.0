import { mockPosts } from '../../../../data/mockData';
import { TravelPost } from '../../../../types/planmate2';
import { useFeedFilters } from '../hooks/useFeedFilters';
import { BestPlannersSection } from '../organisms/BestPlannersSection';
import { FeedHeader } from '../organisms/FeedHeader';
import { HotStaysSection } from '../organisms/HotStaysSection';
import { PostsGrid } from '../organisms/PostsGrid';
import { TagsFilter } from '../organisms/TagsFilter';

type FeedProps = {
  onViewPost: (post: TravelPost) => void;
  onNavigate: (view: any, data?: any) => void;
};

const TAGS = [
  { id: 'all', label: '전체', emoji: '🌍' },
  { id: 'walking', label: '뚜벅이최적화', emoji: '👟' },
  { id: 'j-type', label: '극한의J', emoji: '⚡' },
  { id: 'p-type', label: '여유로운P', emoji: '☕' },
  { id: 'optimal', label: '동선낭비없는', emoji: '🎯' },
];

const BEST_PLANNERS = [
  { name: '제주러버', forkCount: 234, avatar: '🏝️', userId: 'user1' },
  { name: '부산토박이', forkCount: 189, avatar: '🌊', userId: 'user2' },
  { name: '서울워커', forkCount: 156, avatar: '🏙️', userId: 'user3' },
];

export function Feed({ onViewPost, onNavigate }: FeedProps) {
  const {
    selectedTag,
    setSelectedTag,
    searchQuery,
    setSearchQuery,
    filteredPosts
  } = useFeedFilters(mockPosts);

  const hotPosts = [...mockPosts]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <FeedHeader 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />

      <BestPlannersSection planners={BEST_PLANNERS} onNavigate={onNavigate} />

      <HotStaysSection 
        hotPosts={hotPosts} 
        onViewPost={onViewPost} 
      />

      <TagsFilter 
        tags={TAGS} 
        selectedTag={selectedTag} 
        onSelectTag={setSelectedTag} 
      />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <PostsGrid 
          posts={filteredPosts} 
          onViewPost={onViewPost} 
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}