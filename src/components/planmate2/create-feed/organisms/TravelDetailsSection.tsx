import { Copy } from 'lucide-react';
import React from 'react';
import { SectionTitle } from '../atoms/SectionTitle';
import { DestinationSelector } from '../molecules/DestinationSelector';
import { DurationInput } from '../molecules/DurationInput';
import { SchedulePreview } from './SchedulePreview';

interface TravelDetailsSectionProps {
  destination: string;
  setDestination: (val: string) => void;
  showDestinationSelector: boolean;
  setShowDestinationSelector: (val: boolean) => void;
  travelCategories: string[];
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  availableTravels: any[];
  days: number;
  nights: number;
  setDays: (val: number) => void;
  setNights: (val: number) => void;
  setDuration: (val: string) => void;
  schedule: any[];
  onShowPlanModal: () => void;
  includeMemo: boolean;
  setIncludeMemo: (val: boolean) => void;
  /** plan 스냅샷이 담겼는지 — 없으면 다른 사용자가 이 일정을 가져갈 수 없다 */
  isForkable: boolean;
}

export const TravelDetailsSection: React.FC<TravelDetailsSectionProps> = (props) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      {/* 플랜을 가져오면 여행지·기간·상세 일정이 한 번에 채워지므로 한 카드에서 다룬다 */}
      <SectionTitle title="여행 정보">
        <button
          type="button"
          onClick={props.onShowPlanModal}
          className="flex items-center gap-2 bg-[#1344FF] text-white px-5 py-2.5 rounded-xl hover:bg-[#0d34cc] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-100 font-bold text-sm"
        >
          <Copy className="w-4 h-4" />
          내 플랜 가져오기
        </button>
      </SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
        <DestinationSelector
          destination={props.destination}
          setDestination={props.setDestination}
          showDestinationSelector={props.showDestinationSelector}
          setShowDestinationSelector={props.setShowDestinationSelector}
          travelCategories={props.travelCategories}
          selectedCategory={props.selectedCategory}
          setSelectedCategory={props.setSelectedCategory}
          availableTravels={props.availableTravels}
        />
        <DurationInput
          days={props.days}
          nights={props.nights}
          setDays={props.setDays}
          setNights={props.setNights}
          setDuration={props.setDuration}
        />
      </div>

      <div className="mt-8 pt-8 border-t border-[#f3f4f6]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h3 className="text-base font-black text-[#1a1a1a]">상세 일정</h3>
          <label className="flex items-center gap-2 text-sm text-[#666666] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={props.includeMemo}
              onChange={(e) => props.setIncludeMemo(e.target.checked)}
              className="w-4 h-4 accent-[#1344FF]"
            />
            블록 메모도 함께 공개
            <span className="text-xs text-[#999999]">(가져갈 때 메모까지 복사됩니다)</span>
          </label>
        </div>

        {props.schedule.length > 0 && !props.isForkable && (
          <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            이 일정에는 여행지 정보가 없어 다른 사람이 "가져가기"로 복제할 수 없습니다.
            "내 플랜 가져오기"로 일정을 다시 불러오면 복제할 수 있게 됩니다.
          </p>
        )}

        <SchedulePreview schedule={props.schedule} showMemo={props.includeMemo} />
      </div>
    </div>
  );
};
