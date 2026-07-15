import { PostListItem } from '../molecules/PostListItem';

interface PostListTableProps {
  posts: any[];
  type: string;
  onNavigate: (view: any, data?: any) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PostListTable = ({ posts, type, onNavigate, page, totalPages, onPageChange }: PostListTableProps) => {
  // 현재 페이지 주변 최대 5개 페이지 버튼
  const pageNumbers = (() => {
    const total = Math.max(totalPages, 1);
    const start = Math.max(0, Math.min(page - 2, total - 5));
    const end = Math.min(total, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
  })();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {posts.map((post) => (
          <PostListItem
            key={post.id}
            post={post}
            type={type}
            onNavigate={onNavigate}
            onClick={() => onNavigate(type === 'recommend' ? 'recommend-detail' : 'detail', { post: { ...post, category: type } })}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex justify-center gap-1">
          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={
                p === page
                  ? 'w-7 h-7 rounded-lg bg-[#1344FF] text-white flex items-center justify-center text-xs font-bold shadow-sm'
                  : 'w-7 h-7 rounded-lg hover:bg-gray-100 text-[#666666] flex items-center justify-center text-xs font-medium transition-colors'
              }
            >
              {p + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
