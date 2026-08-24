import {
  ArrowLeft, CheckCircle2, Eye, MapPin, Pencil, ThumbsDown, ThumbsUp, Trash2, Users,
} from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';
import { LevelBadge } from '../atoms/LevelBadge';
import {
  useChangeMateStatus, useDeletePost, useJoinMate, useLeaveMate, usePost, usePosts, useReactToPost, useUpdateAnswered,
} from '../hooks/queries';
import { useState } from 'react';
import { CommentSection } from '../organisms/CommentSection';
import { PostListTable } from '../organisms/PostListTable';
import { PostContentViewer } from '../organisms/PostContentViewer';

interface PostDetailPageProps {
  postId: number | string;
  onBack: () => void;
  onNavigate?: (view: any, data?: any) => void;
}

/** 자유/QnA/메이트 게시글 상세 (딥링크 안전 — id로 직접 조회) */
export const PostDetailPage = ({ postId, onBack, onNavigate }: PostDetailPageProps) => {
  const { data: post, isLoading, error } = usePost(postId);
  // 하단 목록은 상세와 독립적으로 페이지를 넘긴다 (지금 글은 그대로 두고 목록만 이동)
  const [listPage, setListPage] = useState(0);
  const { data: boardPage } = usePosts(post?.category, listPage, 'latest', '');
  const boardPosts = boardPage?.items ?? [];
  const react = useReactToPost(postId);
  const joinMate = useJoinMate(postId);
  const leaveMate = useLeaveMate(postId);
  const changeStatus = useChangeMateStatus(postId);
  const updateAnswered = useUpdateAnswered(postId);
  const deletePost = useDeletePost();

  const myUserId = localStorage.getItem('userId');
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const isAuthor = post && myUserId === post.userId;

  const handleReact = async (type: 'like' | 'dislike') => {
    if (!isLoggedIn) { alert('로그인이 필요합니다.'); return; }
    try { await react.mutateAsync(type); } catch (e) { alert((e as Error).message); }
  };

  const handleDelete = async () => {
    if (!post || !confirm('게시글을 삭제할까요?')) return;
    try {
      await deletePost.mutateAsync(post.id);
      onBack();
    } catch (e) { alert((e as Error).message); }
  };

  if (isLoading) {
    return <div className="min-h-[calc(100vh-70px)] bg-[#f4f5f7] px-4 py-16 text-center text-gray-400">게시글을 불러오는 중...</div>;
  }
  if (error || !post) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-[#f4f5f7] px-4 py-16 text-center">
        <p className="text-gray-500 font-medium mb-4">{(error as Error)?.message || '게시글을 찾을 수 없습니다.'}</p>
        <button onClick={onBack} className="text-[#1344FF] font-bold hover:underline">목록으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#f4f5f7] px-4 py-7 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[1120px]">
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 text-sm font-bold text-[#737986] transition-colors hover:text-[#1344FF] group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold">목록으로 돌아가기</span>
      </button>

      <article className="overflow-hidden rounded-[24px] border border-[#e1e3e8] bg-white shadow-[0_8px_28px_rgba(30,40,60,0.03)]">
        {/* 헤더 */}
        <header className="border-b border-[#eef0f3] px-6 py-4 sm:px-9 sm:py-5">
          {(post.category === 'qna' || post.category === 'mate') && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {post.category === 'qna' && (
              <span className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-bold ${post.isAnswered ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {post.isAnswered ? '답변완료' : '답변대기'}
              </span>
            )}
              {post.category === 'mate' && (
              <span className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-bold ${post.status === 'recruiting' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                {post.status === 'recruiting' ? '모집중' : '모집마감'}
              </span>
              )}
            </div>
          )}
          <h1 className="min-w-0 break-keep text-[19px] font-semibold tracking-[-0.02em] text-[#16181d] sm:text-[22px]">{post.title}</h1>
          {/* 메이트 정보 바 */}
          {post.category === 'mate' && (
            <div className="mt-4 flex items-center justify-between bg-blue-50/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#1344FF]" />
                  {post.participants ?? 0}{post.maxParticipants ? ` / ${post.maxParticipants}명` : '명 (제한 없음)'}
                </span>
              </div>
              {isLoggedIn && !isAuthor && (
                <button
                  onClick={async () => {
                    try { await joinMate.mutateAsync(); alert('참여했습니다!'); }
                    catch (e) {
                      const msg = (e as Error).message;
                      if (msg.includes('이미 참여')) {
                        if (confirm('이미 참여 중입니다. 참여를 취소할까요?')) {
                          try { await leaveMate.mutateAsync(); } catch (e2) { alert((e2 as Error).message); }
                        }
                      } else alert(msg);
                    }
                  }}
                  disabled={post.status === 'closed'}
                  className="px-4 py-2 rounded-xl bg-[#1344FF] text-white text-sm font-bold disabled:opacity-40 hover:bg-blue-700 transition-colors"
                >
                  {post.status === 'closed' ? '모집 마감' : '참여하기'}
                </button>
              )}
            </div>
          )}

          {/* 작성자 정보 */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2 text-sm text-[#687080]">
              <UserAvatar
                name={post.author}
                imageUrl={post.authorImage}
                avatarHash={post.authorAvatarHash}
                sizeClass="w-8 h-8"
                className="text-xs"
                onClick={() => onNavigate?.('mypage', { userId: post.userId })}
              />
              <span className="whitespace-nowrap font-extrabold text-[#29303b]">{post.author}</span>
              <LevelBadge level={post.level} />
              <span className="shrink-0">·</span>
              <span className="shrink-0 whitespace-nowrap">{post.createdAt}</span>
              <span className="flex shrink-0 items-center gap-1 whitespace-nowrap"><Eye className="w-4 h-4" />{post.views}</span>
            </div>
            {isAuthor && (
              <div className="flex flex-wrap items-center gap-2">
                {post.category === 'qna' && (
                  <button
                    onClick={() => updateAnswered.mutate(!post.isAnswered)}
                    className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {post.isAnswered ? '답변대기로 변경' : '답변완료로 표시'}
                  </button>
                )}
                {post.category === 'mate' && (
                  <button
                    onClick={() => changeStatus.mutate(post.status === 'recruiting' ? 'closed' : 'recruiting')}
                    className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-[#1344FF] hover:bg-blue-100 transition-colors"
                  >
                    {post.status === 'recruiting' ? '모집 마감하기' : '다시 모집하기'}
                  </button>
                )}
                <button
                  onClick={() => onNavigate?.('community-edit', { post })}
                  className="flex min-h-8 items-center gap-1 whitespace-nowrap rounded-lg bg-[#f3f4f6] px-3 text-xs font-bold text-[#596170] transition-colors hover:bg-[#e7e9ee]"
                >
                  <Pencil className="w-4 h-4" />수정
                </button>
                <button
                  onClick={handleDelete}
                  className="flex min-h-8 items-center gap-1 whitespace-nowrap rounded-lg bg-[#fff0f1] px-3 text-xs font-bold text-[#ef4c55] transition-colors hover:bg-[#ffe1e3]"
                >
                  <Trash2 className="w-4 h-4" />삭제
                </button>
              </div>
            )}
          </div>
        </header>

        {/* 본문 */}
        <div className="post-content-flush min-h-[120px] px-6 py-6 sm:px-9 sm:py-7">
          <PostContentViewer content={post.content} contentText={post.contentText} flush />
        </div>

        {/* 반응 */}
        <div className="flex flex-wrap justify-center gap-3 border-b border-[#eef0f3] px-6 pb-7 sm:px-9">
          <button
            onClick={() => handleReact('like')}
            className={`flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl border px-5 text-sm font-bold transition-colors ${
              post.myReaction === 'like'
                ? 'bg-[#1344FF] text-white border-[#1344FF]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#1344FF] hover:text-[#1344FF]'
            }`}
          >
            <ThumbsUp className="w-4 h-4 shrink-0" />좋아요 {post.likes}
          </button>
          <button
            onClick={() => handleReact('dislike')}
            className={`flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl border px-5 text-sm font-bold transition-colors ${
              post.myReaction === 'dislike'
                ? 'bg-gray-700 text-white border-gray-700'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-500'
            }`}
          >
            <ThumbsDown className="w-4 h-4 shrink-0" />싫어요 {post.dislikes}
          </button>
        </div>

        {/* 지역 정보 (메이트) */}
        {post.category === 'mate' && post.region && (
          <div className="flex items-center gap-1.5 px-6 pb-5 text-sm text-gray-500 sm:px-9">
            <MapPin className="w-4 h-4" />희망 지역: {post.region}
          </div>
        )}

        <CommentSection postId={post.id} />
      </article>

      {/* 글 아래에 게시판 목록을 그대로 붙인다 — 목록으로 나갔다 들어오는 왕복 없이
          다음 글로 계속 넘어갈 수 있고, 지금 글이 어디쯤인지도 보인다 */}
      <div className="mt-5">
        <PostListTable
          posts={boardPosts}
          type={post.category}
          currentPostId={post.id}
          onNavigate={onNavigate ?? (() => {})}
          page={listPage}
          totalPages={boardPage?.totalPages ?? 1}
          onPageChange={setListPage}
        />
      </div>
      </div>
    </div>
  );
};
