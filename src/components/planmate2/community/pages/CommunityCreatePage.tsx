import { BlogTitle } from '../../common/BlogTitle';
import { useCommunityCreateLogic } from '../hooks/useCommunityCreateLogic';
import { CreateHeader } from '../molecules/CreateHeader';
import { EditorSection } from '../organisms/EditorSection';

interface CommunityCreatePageProps {
  type: 'free' | 'qna';
  onBack: () => void;
  onSubmit: () => void;
  editPostId?: number | string;
}

export const CommunityCreatePage = ({ type, onBack, onSubmit, editPostId }: CommunityCreatePageProps) => {
  const { title, setTitle, editor, handleSubmit, isSubmitting, isEditMode } = useCommunityCreateLogic(type, onSubmit, editPostId);
  return (
    <div className="min-h-screen bg-[#f8f9fb] px-4 py-6 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-[960px]">
        <CreateHeader title={isEditMode ? '게시글 수정' : '새 글 쓰기'} onBack={onBack} onSubmit={handleSubmit} isSubmitting={isSubmitting} isEditMode={isEditMode} />
        <article className="overflow-visible rounded-2xl border border-[#e8eaee] bg-white shadow-[0_8px_32px_rgba(30,40,60,0.03)]">
          <div className="px-6 pb-7 pt-8 sm:px-10 sm:pb-9 sm:pt-11">
            <span className="mb-5 inline-flex rounded-full bg-[#f0f4ff] px-3 py-1 text-xs font-semibold text-[#1344FF]">{type === 'qna' ? '질문게시판' : '자유게시판'}</span>
            <label htmlFor="community-title" className="sr-only">게시글 제목</label>
            <BlogTitle id="community-title" value={title} onChange={setTitle} placeholder="제목을 입력하세요" />
            <p className="mt-4 text-sm leading-relaxed text-[#949baa]">{type === 'qna' ? '궁금한 점을 자유롭게 적어주세요. 사진을 함께 올리면 더 자세한 답변을 받을 수 있어요.' : '여행의 순간과 생각을 담아보세요. 글 사이에 사진과 링크를 넣을 수 있어요.'}</p>
          </div>
          <EditorSection editor={editor} />
        </article>
      </div>
    </div>
  );
};
