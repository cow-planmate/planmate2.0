import { ArrowLeft } from 'lucide-react';
import React from 'react';

interface CreatePostHeaderProps {
  onBack: () => void;
}

export const CreatePostHeader: React.FC<CreatePostHeaderProps> = ({ onBack }) => {
  return (
    <div className="bg-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">여행기 작성</h1>
            <p className="text-sm text-[#666666]">당신의 여행을 다른 사람들과 공유해보세요</p>
          </div>
        </div>
      </div>
    </div>
  );
};
