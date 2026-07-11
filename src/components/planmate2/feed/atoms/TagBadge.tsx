import React from 'react';

interface TagBadgeProps {
  tag: string;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag }) => {
  const getTagContent = (t: string) => {
    switch (t) {
      case 'walking': return '👟 뚜벅이';
      case 'j-type': return '⚡ 극한J';
      case 'p-type': return '☕ 여유P';
      case 'optimal': return '🎯 최적화';
      default: return t;
    }
  };

  return (
    <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
      {getTagContent(tag)}
    </span>
  );
};
