import { BoardIcon } from '../molecules/BoardIcon';

interface BoardHeaderProps {
  type: 'free' | 'qna' | 'recommend';
  title: string;
  description: string;
}

export const BoardHeader = ({ type, title, description }: BoardHeaderProps) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <BoardIcon type={type} />
      <div>
        <h1 className="text-xl font-bold text-[#1a1a1a]">{title}</h1>
        <p className="text-xs text-[#666666]">{description}</p>
      </div>
    </div>
  );
};
