import { Bookmark, Share2 } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';

interface RecommendInfoProps {
  author: string;
  authorImage?: string | null;
  authorAvatarHash?: string | null;
  userId?: string;
  createdAt: string;
  views: number;
  onNavigate?: (view: any, data?: any) => void;
}

export const RecommendInfo = ({ author, authorImage, authorAvatarHash, userId, createdAt, views, onNavigate }: RecommendInfoProps) => {
  return (
    <div className="p-8 border-b border-gray-50">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div
          className="flex items-center gap-3"
        >
          <UserAvatar
            name={author}
            imageUrl={authorImage}
            avatarHash={authorAvatarHash}
            sizeClass="w-12 h-12"
            className="text-xl"
            shapeClass="rounded-2xl"
            fallbackClassName="bg-blue-50 text-[#1344FF]"
          />
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
