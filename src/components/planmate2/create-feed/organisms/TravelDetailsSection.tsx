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
        <h3 className="text-base font-black text-[#1a1a1a] mb-6">상세 일정</h3>
        <SchedulePreview schedule={props.schedule} />
      </div>
    </div>
  );
};
