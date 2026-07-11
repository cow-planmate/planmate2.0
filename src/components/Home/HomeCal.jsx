import React from "react";
import { DateRangePicker } from "react-date-range";
import { ko } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function DateRangeModal({
  isOpen,
  onClose,
  dateRange,
  onDateChange,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* 모달 컨텐츠 */}
      <div className=" font-pretendard relative bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden w-[350px]">
        <div className="overflow-x-hidden flex justify-end">
          <DateRangePicker
            ranges={dateRange}
            onChange={onDateChange}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            months={1}
            direction="horizontal"
            staticRanges={[]}
            inputRanges={[]}
            showDateDisplay={false}
            rangeColors={["#1344FF"]}
            locale={ko}
            monthDisplayFormat="yyyy년 MM월"
            weekdayDisplayFormat="eee"
          />
        </div>

        {/* 확인/취소 버튼 */}
        <div className="flex justify-end gap-2 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-pretendard"
          >
            취소
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1344FF] text-white rounded-lg hover:bg-blue-600 transition-colors font-pretendard"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
