import { ArrowLeft, Camera, ThumbsUp, Trash2 } from 'lucide-react';
import { useDeletePost, usePost, useReactToPost } from '../hooks/queries';
import { RecommendHero } from '../molecules/RecommendHero';
import { RecommendInfo } from '../molecules/RecommendInfo';
import { RecommendSidebar } from '../molecules/RecommendSidebar';
import { CommentSection } from '../organisms/CommentSection';
import { PostContentViewer } from '../organisms/PostContentViewer';

interface RecommendDetailPageProps {
  post?: any;          // 목록에서 넘어온 경우의 초기 데이터 (없어도 postId로 조회)
  postId?: number | string;
  onBack: () => void;
  onNavigate?: (view: any, data?: any) => void;
}

export const RecommendDetailPage = ({ post: initialPost, postId, onBack, onNavigate }: RecommendDetailPageProps) => {
  const id = postId ?? initialPost?.id;
  const { data, isLoading, error } = usePost(id);
  const react = useReactToPost(id ?? 0);
  const deletePost = useDeletePost();

  const post = data ?? initialPost;
  const myUserId = localStorage.getItem('userId');
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const isAuthor = post && myUserId === post.userId;

  const handleLike = async () => {
    if (!isLoggedIn) { alert('로그인이 필요합니다.'); return; }
    try { await react.mutateAsync('like'); } catch (e) { alert((e as Error).message); }
  };

  const handleDelete = async () => {
    if (!post || !confirm('게시글을 삭제할까요?')) return;
    try {
      await deletePost.mutateAsync(post.id);
      onBack();
    } catch (e) { alert((e as Error).message); }
  };

  if (isLoading && !post) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">게시글을 불러오는 중...</div>;
  }
  if ((error && !post) || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 font-medium mb-4">{(error as Error)?.message || '게시글을 찾을 수 없습니다.'}</p>
        <button onClick={onBack} className="text-[#1344FF] font-bold hover:underline">목록으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1344FF] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">목록으로 돌아가기</span>
        </button>
        {isAuthor && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />삭제
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <RecommendHero
          image={post.image}
          title={post.title}
          location={post.location}
          rating={post.rating}
        />

        <RecommendInfo
          author={post.author}
          userId={post.userId}
          createdAt={post.createdAt}
          views={post.views}
          onNavigate={onNavigate}
        />

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-500" />
                장소 소개
              </h2>
              <div className="mb-8">
                <PostContentViewer content={data?.content} contentText={data?.contentText ?? post.content} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <RecommendSidebar
                author={post.author}
                likes={post.likes}
              />
            </div>
          </div>
        </div>

        <div className="px-8 py-4 bg-white border-t border-gray-100 flex justify-center">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold border transition-colors ${
              data?.myReaction === 'like'
                ? 'bg-[#1344FF] text-white border-[#1344FF]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#1344FF] hover:text-[#1344FF]'
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
            {data?.likes ?? post.likes}명이 추천했어요
          </button>
        </div>

        {id && <CommentSection postId={id} />}
      </div>
    </div>
  );
};
