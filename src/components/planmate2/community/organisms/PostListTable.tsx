import { PostListItem } from '../molecules/PostListItem';

interface PostListTableProps {
  posts: any[];
  type: string;
  onNavigate: (view: any, data?: any) => void;
}

export const PostListTable = ({ posts, type, onNavigate }: PostListTableProps) => {
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
      
      {/* Pagination Mock */}
      <div className="p-4 border-t border-gray-100 flex justify-center gap-1">
        <button className="w-7 h-7 rounded-lg bg-[#1344FF] text-white flex items-center justify-center text-xs font-bold shadow-sm">1</button>
        <button className="w-7 h-7 rounded-lg hover:bg-gray-100 text-[#666666] flex items-center justify-center text-xs font-medium transition-colors">2</button>
        <button className="w-7 h-7 rounded-lg hover:bg-gray-100 text-[#666666] flex items-center justify-center text-xs font-medium transition-colors">3</button>
        <span className="text-gray-400 flex items-center px-1 text-xs">...</span>
      </div>
    </div>
  );
};
