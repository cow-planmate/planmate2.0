import { Copyright, ExternalLink } from 'lucide-react';

const TOUR_API_INFO_URL = 'https://www.data.go.kr/data/15101578/openapi.do';
const TOUR_API_COPYRIGHT_CODES = new Set(['TYPE1', 'TYPE3']);

interface TourApiAttributionProps {
  className?: string;
  label?: string;
}

export const isTourApiCopyright = (code?: string | null): boolean =>
  TOUR_API_COPYRIGHT_CODES.has(String(code ?? '').trim().toUpperCase());

/** TourAPI 장소 정보와 사진에 공통으로 사용하는 출처 표시. */
export function TourApiAttribution({
  className = '',
  label = '장소 정보·사진 출처',
}: TourApiAttributionProps) {
  return (
    <div
      role="note"
      aria-label="TourAPI 콘텐츠 출처"
      className={`flex w-full flex-wrap items-center justify-end gap-x-1.5 gap-y-0.5 text-right text-[11px] font-medium leading-5 text-slate-500 ${className}`}
    >
      <Copyright className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
      <span>{label}</span>
      <span aria-hidden="true" className="text-slate-300">·</span>
      <a
        href={TOUR_API_INFO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-bold text-slate-600 underline decoration-slate-300 underline-offset-2 transition-colors hover:text-[#1344FF] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1344FF]/30"
        title="한국관광공사 국문 관광정보 서비스 안내"
      >
        한국관광공사 TourAPI
        <ExternalLink className="h-3 w-3" aria-hidden="true" />
      </a>
    </div>
  );
}
