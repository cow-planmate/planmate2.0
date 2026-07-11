import { Bookmark, Share2 } from 'lucide-react';

interface RecommendInfoProps {
  author: string;
  userId?: string;
  createdAt: string;
  views: number;
  onNavigate?: (view: any, data?: any) => void;
}

export const RecommendInfo = ({ author, userId, createdAt, views, onNavigate }: RecommendInfoProps) => {
  return (
    <div className="p-8 border-b border-gray-50">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => onNavigate && userId && onNavigate('mypage', { userId })}
        >
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1344FF] text-xl font-bold">
            {author[0]}
          </div>
          <div>
            <p className="font-bold text-gray-900">{author}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{createdAt}</span>
              <span>•</span>
              <span>조회 {views}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-colors">
            <Share2 className="w-4 h-4" />
            공유하기
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-colors">
            <Bookmark className="w-4 h-4" />
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};
