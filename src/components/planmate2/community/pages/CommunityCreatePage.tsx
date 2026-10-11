import { MapPin, Users } from 'lucide-react';
import { BlogTitle } from '../../common/BlogTitle';
import { useCommunityCreateLogic } from '../hooks/useCommunityCreateLogic';
import { CreateHeader } from '../molecules/CreateHeader';
import { EditorSection } from '../organisms/EditorSection';

interface CommunityCreatePageProps {
  type: 'free' | 'qna' | 'mate';
  onBack: () => void;
  onSubmit: () => void;
  editPostId?: number | string;
}

export const CommunityCreatePage = ({ type, onBack, onSubmit, editPostId }: CommunityCreatePageProps) => {
  const { title, setTitle, region, setRegion, mateCount, setMateCount, editor, handleSubmit, isSubmitting, isEditMode } = useCommunityCreateLogic(type, onSubmit, editPostId);
  const boardName = type === 'qna' ? '질문게시판' : type === 'mate' ? '메이트 찾기' : '자유게시판';
  return (
    <div className="min-h-screen bg-[#f8f9fb] px-4 py-6 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-[960px]">
        <CreateHeader title={isEditMode ? '게시글 수정' : '새 글 쓰기'} onBack={onBack} onSubmit={handleSubmit} isSubmitting={isSubmitting} isEditMode={isEditMode} />
        <article className="overflow-visible rounded-2xl border border-[#e8eaee] bg-white shadow-[0_8px_32px_rgba(30,40,60,0.03)]">
          <div className="px-6 pb-7 pt-8 sm:px-10 sm:pb-9 sm:pt-11">
            <span className="mb-5 inline-flex rounded-full bg-[#f0f4ff] px-3 py-1 text-xs font-semibold text-[#1344FF]">{boardName}</span>
            <label htmlFor="community-title" className="sr-only">게시글 제목</label>
            <BlogTitle id="community-title" value={title} onChange={setTitle} placeholder="제목을 입력하세요" />
            <p className="mt-4 text-sm leading-relaxed text-[#949baa]">{type === 'qna' ? '궁금한 점을 자유롭게 적어주세요. 사진을 함께 올리면 더 자세한 답변을 받을 수 있어요.' : type === 'mate' ? '함께 여행할 메이트를 찾아보세요. 일정과 희망하는 동행 성향을 적어두면 매칭이 빨라요.' : '여행의 순간과 생각을 담아보세요. 글 사이에 사진과 링크를 넣을 수 있어요.'}</p>
          </div>
          {type === 'mate' && (
            <div className="flex flex-col border-y border-[#eef0f3] bg-blue-50/20 sm:flex-row">
              <label className="flex flex-1 items-center gap-2 border-b border-[#eef0f3] px-6 py-3 sm:border-b-0 sm:border-r sm:px-10">
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
              <label className="flex items-center gap-3 px-6 py-3 sm:px-8">
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
        </article>
      </div>
    </div>
  );
};
