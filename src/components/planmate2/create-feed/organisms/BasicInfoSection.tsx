import { Image as ImageIcon } from 'lucide-react';
import React from 'react';
import { SectionTitle } from '../atoms/SectionTitle';

interface BasicInfoSectionProps {
  title: string;
  setTitle: (val: string) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ title, setTitle }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <SectionTitle title="기본 정보" />

      <div className="mb-6">
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

      {/* 대표 이미지는 더 이상 직접 올리지 않는다 (등록 시 자동 선정) — 어디서 오는지는 알려준다 */}
      <div className="flex items-start gap-2 text-xs text-[#666666] bg-[#f8f9fa] rounded-xl px-4 py-3">
        <ImageIcon className="w-4 h-4 mt-0.5 text-[#999999] shrink-0" />
        <p>
          대표 이미지는 가져온 일정의 첫 장소 사진이 자동으로 사용됩니다.
          장소 사진이 없으면 본문에 넣은 첫 번째 이미지가 대신 쓰입니다.
        </p>
      </div>
    </div>
  );
};
