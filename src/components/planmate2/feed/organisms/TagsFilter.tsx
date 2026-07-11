import React from 'react';

interface Tag {
  id: string;
  label: string;
  emoji: string;
}

interface TagsFilterProps {
  tags: Tag[];
  selectedTag: string;
  onSelectTag: (id: string) => void;
}

export const TagsFilter: React.FC<TagsFilterProps> = ({ tags, selectedTag, onSelectTag }) => {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-[113px] z-30">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onSelectTag(tag.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTag === tag.id
                  ? 'bg-[#1344FF] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <span className="mr-1">{tag.emoji}</span>
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
