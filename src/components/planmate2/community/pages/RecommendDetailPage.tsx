import { ArrowLeft, Camera, MessageCircle, ThumbsUp } from 'lucide-react';
import { RecommendHero } from '../molecules/RecommendHero';
import { RecommendInfo } from '../molecules/RecommendInfo';
import { RecommendSidebar } from '../molecules/RecommendSidebar';

interface RecommendDetailPageProps {
  post: any;
  onBack: () => void;
  onNavigate?: (view: any, data?: any) => void;
}

export const RecommendDetailPage = ({ post: initialPost, onBack, onNavigate }: RecommendDetailPageProps) => {
  const post = initialPost || {
    id: 1,
    title: '[제주] 분위기 좋은 애월 카페 추천합니다!',
    author: '추천왕1',
    userId: 'user1',
    content: '여기는 정말 제가 아껴둔 곳인데 공유합니다. 노을이 보일 때 가면 정말 환상적이에요. 커피 맛도 일품이고 사장님이 친절하셔서 더 기분이 좋아지는 곳입니다. 애월 해안도로 따라 쭉 가다 보면 있어요!',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop',
    location: '제주도 애월읍',
    rating: '4.8',
    likes: 245,
    views: 1240,
    comments: 32,
    createdAt: '3시간 전'
  };

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
              <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap mb-8">
                {post.content}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="aspect-video bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <img src="https://images.unsplash.com/photo-1544644113-9c6955c77a45?w=500&auto=format&fit=crop" className="w-full h-full object-cover" alt="" />
                </div>
                <div className="aspect-video bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop" className="w-full h-full object-cover" alt="" />
                </div>
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

        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-500">
              <MessageCircle className="w-5 h-5" />
              <span className="font-bold">{post.comments}개의 댓글</span>
            </div>
            <div className="flex items-center gap-2 text-[#1344FF]">
              <ThumbsUp className="w-5 h-5" />
              <span className="font-bold">{post.likes}명의 추천</span>
            </div>
          </div>
          <button className="text-[#1344FF] font-bold hover:underline">
            댓글 더보기
          </button>
        </div>
      </div>
    </div>
  );
};
