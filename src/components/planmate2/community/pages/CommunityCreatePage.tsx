import { MapPin, Users } from 'lucide-react';
import { useCommunityCreateLogic } from '../hooks/useCommunityCreateLogic';
import { CreateHeader } from '../molecules/CreateHeader';
import { GuidelineSection } from '../molecules/GuidelineSection';
import { EditorSection } from '../organisms/EditorSection';

interface CommunityCreatePageProps {
  type: 'free' | 'qna' | 'mate';
  onBack: () => void;
  onSubmit: () => void;
  /** 지정하면 해당 게시글의 수정 모드로 연다 */
  editPostId?: number | string;
}

export const CommunityCreatePage = ({ type, onBack, onSubmit, editPostId }: CommunityCreatePageProps) => {
  const {
    title,
    setTitle,
    region,
    setRegion,
    mateCount,
    setMateCount,
    editor,
    handleSubmit,
    isSubmitting,
    isEditMode,
    getTips
  } = useCommunityCreateLogic(type, onSubmit, editPostId);

  const getPageTitle = () => {
    if (isEditMode) return '게시글 수정';
    switch (type) {
      case 'free': return '자유게시판 글쓰기';
      case 'qna': return '질문게시판 질문하기';
      case 'mate': return '메이트 찾기 글쓰기';
      default: return '글쓰기';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 min-h-screen">
      <CreateHeader
        title={getPageTitle()}
        onBack={onBack}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-6 py-4 text-lg font-bold focus:outline-none placeholder:text-gray-300"
          />
        </div>

        {type === 'mate' && (
          <div className="flex flex-col border-b border-gray-100 bg-blue-50/20 sm:flex-row">
            <label className="flex flex-1 items-center gap-2 border-b border-gray-100 px-6 py-3 sm:border-b-0 sm:border-r">
              <MapPin className="h-4 w-4 shrink-0 text-[#1344FF]" />
              <span className="sr-only">여행 희망 지역</span>
              <input
                type="text"
                placeholder="여행 희망 지역 (예: 제주)"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                maxLength={50}
                className="w-full bg-transparent text-sm font-medium placeholder:text-blue-300 focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-3 px-6 py-3">
              <Users className="h-4 w-4 text-[#1344FF]" />
              <span className="whitespace-nowrap text-sm font-bold text-gray-700">모집 인원</span>
              <select
                value={mateCount}
                onChange={(e) => setMateCount(e.target.value)}
                className="cursor-pointer bg-transparent text-sm font-bold text-[#1344FF] focus:outline-none"
              >
                {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n}명</option>
                ))}
                <option value="unlimited">인원 제한 없음</option>
              </select>
            </label>
          </div>
        )}

        <EditorSection editor={editor} />
      </div>

      <GuidelineSection
        type={type}
        tips={getTips()}
      />
    </div>
  );
};
