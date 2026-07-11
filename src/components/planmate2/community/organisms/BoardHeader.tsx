import { ArrowLeft } from 'lucide-react';
import { BoardIcon } from '../molecules/BoardIcon';

interface BoardHeaderProps {
  type: 'free' | 'qna' | 'mate' | 'recommend';
  title: string;
  description: string;
  onBack: () => void;
}

export const BoardHeader = ({ type, title, description, onBack }: BoardHeaderProps) => {
  return (
    <div className="flex items-center gap-3 mb-4">
      <button 
        onClick={onBack}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-[#1a1a1a]" />
      </button>
      <div className="flex items-center gap-2">
        <BoardIcon type={type} />
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">{title}</h1>
          <p className="text-xs text-[#666666]">{description}</p>
        </div>
      </div>
    </div>
  );
};
