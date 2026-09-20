import { ImageIcon } from 'lucide-react';
import { authorNameClass, authorNavProps } from '../../common/authorLink';
import { UserAvatar } from '../../common/UserAvatar';

interface PostListItemProps {
  post: any;
  type: string;
  /** 지금 보고 있는 글이면 목록에서 어디쯤인지 알 수 있게 표시한다 */
  isCurrent?: boolean;
  onClick: () => void;
  onNavigate: (view: any, data?: any) => void;
}

/** 게시판 성격별 앞머리 배지 (답변 여부·모집 현황) */
const StatusBadge = ({ post, type }: { post: any; type: string }) => {
  if (type === 'qna') {
    return post.isAnswered
      ? <span className="shrink-0 px-1.5 py-0.5 bg-green-50 text-green-700 text-[11px] rounded font-bold">답변완료</span>
      : <span className="shrink-0 px-1.5 py-0.5 bg-gray-50 text-gray-600 text-[11px] rounded font-bold">답변대기</span>;
  }
  return null;
};

/**
 * 게시판 목록의 한 행 — 제목·글쓴이·등록일·조회·추천을 열로 정렬한다.
 *
 * 좁은 화면에서는 열을 그대로 유지할 수 없어(제목이 두 글자씩 끊긴다) 제목 한 줄 +
 * 메타 한 줄로 접는다. 열 순서는 데스크톱과 같아서 읽는 순서는 달라지지 않는다.
 */
export const PostListItem = ({ post, type, isCurrent, onClick, onNavigate }: PostListItemProps) => {
  const authorNav = authorNavProps(post, onNavigate);

  const title = (
    <>
      <StatusBadge post={post} type={type} />
      <span className={`truncate group-hover:text-[#1344FF] group-hover:underline ${isCurrent ? 'font-bold text-[#1344FF]' : ''}`}>{post.title}</span>
      {post.comments > 0 && (
        <span className="shrink-0 text-[#1344FF] font-bold tabular-nums">[{post.comments}]</span>
      )}
      {post.image && <ImageIcon className="shrink-0 w-4 h-4 text-[#9aa0ab]" />}
    </>
  );

  const author = (
    <div className="flex min-w-0 items-center gap-2">
      <UserAvatar
        name={post.author}
        imageUrl={post.authorImage}
        avatarHash={post.authorAvatarHash}
        sizeClass="h-6 w-6"
        className="shrink-0"
        onClick={(e) => { e.stopPropagation(); authorNav.onClick?.(e); }}
      />
      <button
        type="button"
        disabled={!authorNav.onClick}
        onClick={(e) => { e.stopPropagation(); authorNav.onClick?.(e); }}
        className={`truncate font-medium ${authorNameClass(post, 'text-[#3a4150] hover:text-[#1344FF] hover:underline')}`}
      >
        {post.author}
      </button>
    </div>
  );

  return (
    <div
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      role="link"
      tabIndex={0}
      className={`group cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1344FF] ${isCurrent ? 'bg-[#eef2ff]' : 'hover:bg-[#f7f9ff]'}`}
    >
      {/* 데스크톱: 표 */}
      <div className="hidden sm:grid min-h-16 grid-cols-[minmax(0,1fr)_150px_100px_88px_88px] items-center gap-2 px-6 py-3 text-[16px]">
        <span className="flex items-center gap-1.5 min-w-0 text-[#16181d]">{title}</span>
        <span className="flex min-w-0 justify-center">{author}</span>
        <span className="text-center text-[13px] text-[#6b7280] whitespace-nowrap">{post.createdAt}</span>
        <span className="text-center text-[13px] text-[#6b7280] tabular-nums">{post.views}</span>
        <span className="text-center text-[13px] text-[#6b7280] tabular-nums">{post.likes}</span>
      </div>

      {/* 모바일: 제목 + 메타 두 줄 */}
      <div className="sm:hidden px-4 py-3">
        <div className="flex items-center gap-1.5 min-w-0 text-[15px] font-medium text-[#16181d]">{title}</div>
        <div className="mt-1 flex items-center gap-2 text-[12px] text-[#6b7280]">
          <span className="min-w-0 max-w-[40%] flex">{author}</span>
          <span className="text-[#d4d7dd]">·</span>
          <span className="whitespace-nowrap">{post.createdAt}</span>
          <span className="text-[#d4d7dd]">·</span>
          <span className="whitespace-nowrap">조회 {post.views}</span>
          <span className="text-[#d4d7dd]">·</span>
          <span className="whitespace-nowrap">추천 {post.likes}</span>
        </div>
      </div>
    </div>
  );
};
