import React from 'react';
import { SectionTitle } from '../atoms/SectionTitle';
import { CoverImageUploader } from '../molecules/CoverImageUploader';

interface BasicInfoSectionProps {
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  coverImage: string | null;
  setCoverImage: (val: string | null) => void;
  tags: string[];
  selectedTags: string[];
  toggleTag: (tag: string) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  title, setTitle,
  description, setDescription,
  coverImage, setCoverImage,
  tags,
  selectedTags,
  toggleTag,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <SectionTitle title="기본 정보" />
      
      <CoverImageUploader coverImage={coverImage} setCoverImage={setCoverImage} />

      <div className="mb-8">
        <label className="block text-sm font-bold text-[#444444] mb-3">
          제목 <span className="text-red-500">*</span>
        </label>
        <div className="border-b-2 border-[#e5e7eb] focus-within:border-[#1344FF] transition-colors pb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 서울 3박 4일 완벽 여행 코스"
            className="w-full bg-transparent text-lg font-medium placeholder-[#cccccc] focus:outline-none text-[#1a1a1a]"
            required
          />
        </div>
      </div>

      <div className="mb-10">
        <label className="block text-sm font-bold text-[#444444] mb-3">
          간단 설명
        </label>
        <div className="border-b-2 border-[#e5e7eb] focus-within:border-[#1344FF] transition-colors pb-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="여행의 하이라이트를 한 문장으로 소개해주세요"
            rows={1}
            className="w-full bg-transparent text-lg font-medium placeholder-[#cccccc] focus:outline-none resize-none text-[#1a1a1a]"
          />
        </div>
      </div>

      <div className="mb-2">
        <label className="block text-sm font-bold text-[#444444] mb-3">
          이 여행을 설명하는 키워드
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 border ${
                  isSelected
                    ? 'bg-[#1344FF] border-[#1344FF] text-white shadow-lg shadow-blue-100 scale-105'
                    : 'bg-white border-[#e5e7eb] text-[#666666] hover:border-[#1344FF] hover:text-[#1344FF]'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
