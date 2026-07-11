import { Calendar, ChevronRight } from 'lucide-react';
import React from 'react';

interface DurationInputProps {
  days: number;
  nights: number;
  setDays: (val: number) => void;
  setNights: (val: number) => void;
  setDuration: (val: string) => void;
}

export const DurationInput: React.FC<DurationInputProps> = ({ days, nights, setDays, setNights, setDuration }) => {
  return (
    <div className="lg:col-span-2">
      <label className="block text-sm font-bold text-[#444444] mb-3 flex items-center gap-2 h-5">
        <Calendar className="w-4 h-4 text-[#1344FF]" />
        여행 기간 <span className="text-red-500">*</span>
      </label>

      <div className="flex items-center gap-4 h-[46px]">
        <div className="relative flex-[1.2] border-b-2 border-[#e5e7eb] focus-within:border-[#1344FF] transition-colors pb-2 flex items-center h-full">
          <input
            type="number"
            min="1"
            value={days}
            onChange={(e) => {
              const d = parseInt(e.target.value) || 1;
              const n = Math.max(0, d - 1);
              setDays(d);
              setNights(n);
              setDuration(`${n}박 ${d}일`);
            }}
            className="w-full bg-transparent text-lg font-medium focus:outline-none pr-8 text-[#1a1a1a]"
            required
          />
          <span className="absolute right-0 bottom-2.5 text-base font-bold text-[#999999]">일</span>
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
        
        <div className="flex-1 bg-[#1344FF] rounded-2xl h-full shadow-lg shadow-blue-100 flex items-center justify-center whitespace-nowrap transform hover:rotate-1 transition-transform cursor-default px-4">
          <div className="text-white text-lg font-medium tracking-tight">
            {nights}박 {days}일
          </div>
        </div>
      </div>
      <p className="mt-4 text-[11px] text-[#999999] font-medium">* 일자만 입력하면 숙박 일수가 자동으로 계산됩니다.</p>
    </div>
  );
};
