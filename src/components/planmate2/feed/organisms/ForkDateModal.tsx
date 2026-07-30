import { CalendarDays } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ModalFrame } from '../../mypage/molecules/ModalFrame';
import { getEndDate } from '../utils/itineraryToPlan';
// @ts-ignore — 레거시 JSX 유틸 (YYYY-MM-DD 포맷)
import { formatDateForApi } from '../../../../utils/homeDate';

interface ForkDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 일정의 총 일수 */
  dayCount: number;
  isSubmitting: boolean;
  onConfirm: (startDate: Date) => void;
}

const formatKorean = (date: Date) =>
  `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

/**
 * 가져가기 시작일 선택.
 * 원본 여행 날짜를 그대로 복사하면 대부분 과거 일정이 되므로,
 * N박 M일 구조만 유지한 채 사용자가 고른 날짜부터 다시 배치한다.
 */
export const ForkDateModal: React.FC<ForkDateModalProps> = ({
  isOpen,
  onClose,
  dayCount,
  isSubmitting,
  onConfirm,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [value, setValue] = useState(() => formatDateForApi(tomorrow));

  // 모달을 다시 열면 기본값(내일)으로 되돌린다
  useEffect(() => {
    if (isOpen) setValue(formatDateForApi(tomorrow));
  }, [isOpen]);

  const startDate = value ? new Date(`${value}T00:00:00`) : null;
  const isValid = startDate != null && !Number.isNaN(startDate.getTime());
  const endDate = isValid ? getEndDate(startDate, dayCount) : null;
  const nights = Math.max(0, dayCount - 1);

  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onClose}
      title="언제 떠나시나요?"
      subtitle={`${nights}박 ${dayCount}일 일정이 선택한 날짜부터 채워집니다`}
      maxWidth="sm"
      closeOnOverlayClick={!isSubmitting}
    >
      <div className="space-y-5">
        <label className="block">
          <span className="text-sm font-bold text-[#1a1a1a]">출발일</span>
          <input
            type="date"
            value={value}
            min={formatDateForApi(today)}
            onChange={(e) => setValue(e.target.value)}
            className="mt-2 w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-[#1344FF]"
          />
        </label>

        {isValid && endDate && (
          <div className="flex items-center gap-2 bg-[#f8f9fa] rounded-xl px-4 py-3 text-sm text-[#666666]">
            <CalendarDays className="w-4 h-4 text-[#1344FF] shrink-0" />
            <span className="font-bold text-[#1a1a1a]">
              {formatKorean(startDate)} ~ {formatKorean(endDate)}
            </span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl border border-[#e5e7eb] text-[#666666] font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => isValid && onConfirm(startDate)}
            disabled={!isValid || isSubmitting}
            className="flex-1 py-3 rounded-xl bg-[#1344FF] text-white font-bold hover:bg-[#0d34cc] transition-colors disabled:bg-gray-200 disabled:text-gray-400"
          >
            {isSubmitting ? '가져오는 중…' : '내 여행에 담기'}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
};
