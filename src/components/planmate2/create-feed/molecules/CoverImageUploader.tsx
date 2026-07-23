import { Image as ImageIcon, X } from 'lucide-react';
import React, { useRef } from 'react';

interface CoverImageUploaderProps {
  coverImage: string | null;
  setCoverImage: (image: string | null) => void;
}

export const CoverImageUploader: React.FC<CoverImageUploaderProps> = ({ coverImage, setCoverImage }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    // data URL로 읽어 미리보기에 넣는다. 실제 업로드(MinIO)는 제출 시 resolveThumbnailUrl이 처리한다.
    const reader = new FileReader();
    reader.onload = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
    // 같은 파일을 지웠다가 다시 선택해도 onChange가 발생하도록 초기화
    e.target.value = '';
  };

  return (
    <div className="mb-8">
      <label className="block text-sm font-bold text-[#444444] mb-3">
        대표 이미지
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

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
          onClick={() => inputRef.current?.click()}
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
