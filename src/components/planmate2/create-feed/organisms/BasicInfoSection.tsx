import { BlogTitle } from '../../common/BlogTitle';

interface BasicInfoSectionProps {
  title: string;
  setTitle: (val: string) => void;
}

export const BasicInfoSection = ({ title, setTitle }: BasicInfoSectionProps) => (
  <div className="px-6 pb-7 pt-8 sm:px-10 sm:pb-9 sm:pt-11">
    <span className="mb-5 inline-flex rounded-full bg-[#f0f4ff] px-3 py-1 text-xs font-semibold text-[#1344FF]">여행기</span>
    <label htmlFor="travel-title" className="sr-only">여행기 제목</label>
    <BlogTitle id="travel-title" value={title} onChange={setTitle} placeholder="여행의 제목을 지어주세요" required />
    <p className="mt-4 text-sm leading-relaxed text-[#949baa]">여행에서 만난 풍경과 이야기를 사진과 함께 기록해보세요.</p>
  </div>
);
