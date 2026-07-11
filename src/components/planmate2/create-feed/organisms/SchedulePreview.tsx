import { Clock, Copy } from 'lucide-react';
import React from 'react';
import { SectionTitle } from '../atoms/SectionTitle';

interface SchedulePreviewProps {
  schedule: any[];
  onShowPlanModal: () => void;
}

export const SchedulePreview: React.FC<SchedulePreviewProps> = ({ schedule, onShowPlanModal }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <SectionTitle title="상세 일정">
        <button
          type="button"
          onClick={onShowPlanModal}
          className="flex items-center gap-2 bg-[#1344FF] text-white px-5 py-2.5 rounded-xl hover:bg-[#0d34cc] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-100 font-bold text-sm"
        >
          <Copy className="w-4 h-4" />
          내 플랜 가져오기
        </button>
      </SectionTitle>

      {schedule.length > 0 ? (
        <div className="space-y-6">
          {schedule.map((day) => (
            <div key={day.day} className="border border-[#e5e7eb] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#1344FF] text-white rounded-full flex items-center justify-center font-bold">
                  D{day.day}
                </div>
                <div>
                  <p className="font-bold text-[#1a1a1a]">{day.day}일차</p>
                  <p className="text-sm text-[#666666]">{day.date}</p>
                </div>
              </div>
              <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 italic">
                {day.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4 relative">
                    <div className="w-9 h-9 rounded-full bg-white border-2 border-[#1344FF] flex items-center justify-center text-[10px] font-black text-[#1344FF] z-10 shrink-0 shadow-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1 bg-[#f8f9fa] hover:bg-white hover:shadow-md transition-all p-4 rounded-2xl border border-transparent hover:border-[#efefef]">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-[#1a1a1a]">{item.place}</p>
                        <span className="text-[11px] font-bold text-[#1344FF] bg-blue-50 px-2 py-0.5 rounded-md">{item.time}</span>
                      </div>
                      <p className="text-sm text-[#666666] line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-[#e5e7eb] rounded-xl">
          <Clock className="w-12 h-12 text-[#666666] mx-auto mb-3" />
          <p className="text-[#666666] mb-2">아직 일정이 없습니다</p>
          <p className="text-sm text-[#999999]">위의 "내 플랜 가져오기" 버튼을 눌러 일정을 추가하세요</p>
        </div>
      )}
    </div>
  );
};
