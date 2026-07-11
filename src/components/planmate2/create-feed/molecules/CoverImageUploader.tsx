import { Image as ImageIcon, X } from 'lucide-react';
import React from 'react';

interface CoverImageUploaderProps {
  coverImage: string | null;
  setCoverImage: (image: string | null) => void;
}

export const CoverImageUploader: React.FC<CoverImageUploaderProps> = ({ coverImage, setCoverImage }) => {
  return (
    <div className="mb-8">
      <label className="block text-sm font-bold text-[#444444] mb-3">
        대표 이미지
      </label>
      {coverImage ? (
        <div className="relative">
          <img src={coverImage} alt="대표 이미지" className="w-full h-72 object-cover rounded-2xl shadow-inner" />
          <button
            type="button"
            onClick={() => setCoverImage(null)}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#1a1a1a] p-2.5 rounded-full hover:bg-white shadow-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => setCoverImage('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=600&fit=crop')}
          className="border-2 border-dashed border-[#e5e7eb] rounded-2xl p-12 text-center hover:border-[#1344FF] hover:bg-blue-50/30 transition-all cursor-pointer"
        >
          <ImageIcon className="w-14 h-14 text-[#cccccc] mx-auto mb-4" />
          <p className="text-[#666666] font-bold mb-1">클릭하여 대표 이미지를 업로드하세요</p>
          <p className="text-xs text-[#999999]">권장 사이즈: 1200 x 600px (JPG, PNG)</p>
        </div>
      )}
    </div>
  );
};
