import { PostListItem } from '../molecules/PostListItem';

interface PostListTableProps {
  posts: any[];
  type: string;
  onNavigate: (view: any, data?: any) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** 상세 화면 아래에 붙일 때, 지금 보고 있는 글을 표시한다 */
  currentPostId?: number | string;
  embedded?: boolean;
}

export const PostListTable = ({ posts, type, onNavigate, page, totalPages, onPageChange, currentPostId, embedded = false }: PostListTableProps) => {
  // 현재 페이지 주변 최대 5개 페이지 버튼
  const pageNumbers = (() => {
    const total = Math.max(totalPages, 1);
    const start = Math.max(0, Math.min(page - 2, total - 5));
    const end = Math.min(total, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
  })();

  return (
    <div className={embedded ? 'bg-white' : 'overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm'}>
      {/* 열 제목 — 표에서 숫자가 무엇을 세는지 알려주는 유일한 단서라 목록 위에 고정한다.
          좁은 화면에서는 행 자체가 표가 아니므로 함께 숨긴다 */}
      <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_150px_100px_88px_88px] items-center gap-2 px-6 py-4 bg-[#fafbfc] border-b border-gray-200 text-[14px] font-bold text-[#6b7280]">
        <span>제목</span>
        <span className="text-center">글쓴이</span>
        <span className="text-center">등록일</span>
        <span className="text-center">조회</span>
        <span className="text-center">추천</span>
      </div>

      <div className="divide-y divide-gray-100">
        {posts.map((post) => (
          <PostListItem
            key={post.id}
            post={post}
            type={type}
            isCurrent={String(post.id) === String(currentPostId)}
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
