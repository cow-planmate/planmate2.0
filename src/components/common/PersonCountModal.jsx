import React, { useEffect, useState } from "react";

export default function PersonCountModal({
  isOpen,
  onClose,
  personCount,
  onPersonCountChange,
}) {
  const [adults, setAdults] = useState(personCount.adults || 0);
  const [children, setChildren] = useState(personCount.children || 0);

  useEffect(() => {
    setAdults(personCount.adults || 0);
    setChildren(personCount.children || 0);
  }, [personCount]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onPersonCountChange({ adults, children });
    onClose();
  };

  const Counter = ({ label, value, setValue, min = 0 }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
      <span className="text-gray-700 font-pretendard">{label}</span>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setValue(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600"
        >
          −
        </button>
        <span className="w-8 text-center font-pretendard">{value}</span>
        <button
          onClick={() => setValue(value + 1)}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-[320px] mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 font-pretendard">
            인원수
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* 카운터 */}
        <div className="p-4">
          <Counter
            label="성인 ( 만 18세 이상 )"
            value={adults}
            setValue={setAdults}
            min={0}
          />
          <Counter
            label="어린이 ( 만 17세 이하 )"
            value={children}
            setValue={setChildren}
            min={0}
          />
        </div>

        {/* 완료 버튼 */}
        <div className="p-4 text-center">
          <button
            onClick={handleConfirm}
            className="bg-main hover:bg-gray-300 text-white px-6 py-2 rounded font-pretendard transition-colors"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
