import {
  ArrowLeft, CheckCircle2, Eye, MapPin, ThumbsDown, ThumbsUp, Trash2, Users,
} from 'lucide-react';
import { LevelBadge } from '../atoms/LevelBadge';
import {
  useChangeMateStatus, useDeletePost, useJoinMate, useLeaveMate, usePost, useReactToPost, useUpdateAnswered,
} from '../hooks/queries';
import { CommentSection } from '../organisms/CommentSection';
import { PostContentViewer } from '../organisms/PostContentViewer';

interface PostDetailPageProps {
  postId: number | string;
  onBack: () => void;
  onNavigate?: (view: any, data?: any) => void;
}

/** 자유/QnA/메이트 게시글 상세 (딥링크 안전 — id로 직접 조회) */
export const PostDetailPage = ({ postId, onBack }: PostDetailPageProps) => {
  const { data: post, isLoading, error } = usePost(postId);
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
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">게시글을 불러오는 중...</div>;
  }
  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 font-medium mb-4">{(error as Error)?.message || '게시글을 찾을 수 없습니다.'}</p>
        <button onClick={onBack} className="text-[#1344FF] font-bold hover:underline">목록으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-[#1344FF] transition-colors mb-6 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold">목록으로 돌아가기</span>
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 헤더 */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            {post.category === 'qna' && (
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${post.isAnswered ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {post.isAnswered ? '답변완료' : '답변대기'}
              </span>
            )}
            {post.category === 'mate' && (
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${post.status === 'recruiting' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                {post.status === 'recruiting' ? '모집중' : '모집마감'}
              </span>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-bold text-gray-700">{post.author}</span>
              <LevelBadge level={post.level} />
              <span>·</span>
              <span>{post.createdAt}</span>
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{post.views}</span>
            </div>
            {isAuthor && (
              <div className="flex items-center gap-2">
                {post.category === 'qna' && (
                  <button
                    onClick={() => updateAnswered.mutate(!post.isAnswered)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {post.isAnswered ? '답변대기로 변경' : '답변완료로 표시'}
                  </button>
                )}
                {post.category === 'mate' && (
                  <button
                    onClick={() => changeStatus.mutate(post.status === 'recruiting' ? 'closed' : 'recruiting')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-[#1344FF] hover:bg-blue-100 transition-colors"
                  >
                    {post.status === 'recruiting' ? '모집 마감하기' : '다시 모집하기'}
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />삭제
                </button>
              </div>
            )}
          </div>

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
        </div>

        {/* 본문 */}
        <div className="p-8">
          <PostContentViewer content={post.content} contentText={post.contentText} />
        </div>

        {/* 반응 */}
        <div className="px-8 pb-8 flex justify-center gap-3">
          <button
            onClick={() => handleReact('like')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border transition-colors ${
              post.myReaction === 'like'
                ? 'bg-[#1344FF] text-white border-[#1344FF]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#1344FF] hover:text-[#1344FF]'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />좋아요 {post.likes}
          </button>
          <button
            onClick={() => handleReact('dislike')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border transition-colors ${
              post.myReaction === 'dislike'
                ? 'bg-gray-700 text-white border-gray-700'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-500'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />싫어요 {post.dislikes}
          </button>
        </div>

        {/* 지역 정보 (메이트) */}
        {post.category === 'mate' && post.region && (
          <div className="px-8 pb-4 flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />희망 지역: {post.region}
          </div>
        )}

        <CommentSection postId={post.id} />
      </div>
    </div>
  );
};
