import { ArrowLeft } from 'lucide-react';

interface CreateHeaderProps {
  title: string;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

export const CreateHeader = ({ title, onBack, onSubmit, isSubmitting, isEditMode }: CreateHeaderProps) => (
  <div className="mb-8 flex items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3">
      <button type="button" onClick={onBack} aria-label="글쓰기 나가기" className="rounded-xl p-2 text-[#687080] transition-colors hover:bg-white"><ArrowLeft className="h-5 w-5" /></button>
      <h1 className="text-sm font-semibold text-[#687080]">{title}</h1>
    </div>
    <button type="button" onClick={onSubmit} disabled={isSubmitting} className="shrink-0 rounded-full bg-[#1344FF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0d34cc] disabled:opacity-40">
      {isSubmitting ? '저장 중…' : isEditMode ? '수정 완료' : '발행하기'}
    </button>
  </div>
);
