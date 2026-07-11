import { HelpCircle, MapPin, MessageSquare, Users } from 'lucide-react';

interface BoardIconProps {
  type: 'free' | 'qna' | 'mate' | 'recommend';
}

export const BoardIcon = ({ type }: BoardIconProps) => {
  const getIcon = () => {
    switch (type) {
      case 'free': return <MessageSquare className="w-6 h-6 text-[#1344FF]" />;
      case 'qna': return <HelpCircle className="w-6 h-6 text-orange-500" />;
      case 'mate': return <Users className="w-6 h-6 text-purple-500" />;
      case 'recommend': return <MapPin className="w-6 h-6 text-emerald-500" />;
      default: return null;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'free': return 'bg-blue-50';
      case 'qna': return 'bg-orange-50';
      case 'mate': return 'bg-purple-50';
      case 'recommend': return 'bg-emerald-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className={`w-10 h-10 ${getIconBg()} rounded-lg flex items-center justify-center`}>
      {getIcon()}
    </div>
  );
};
