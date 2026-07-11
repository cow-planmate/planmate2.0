import React, { useState } from "react";
import { useApiClient } from "../../hooks/useApiClient";
import { useQuery } from "@tanstack/react-query";

export default function LocationModal({
  isOpen,
  onClose,
  onLocationSelect,
  modalType, // "departure" 또는 "destination"
}) {
  const [selectedUpperRegion, setSelectedUpperRegion] = useState("");
  const [selectedLowerRegion, setSelectedLowerRegion] = useState(null); // 초기값을 null로 변경
  const { get } = useApiClient();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const { data: regionData = { 상위지역: {}, 하위지역: {} } } = useQuery({
    queryKey: ["travel"],
    queryFn: async () => {
      const res = await get(`${BASE_URL}/api/travel`);

      const upperRegions = {};
      if (res && res.travels) {
        res.travels.forEach((item) => {
          const categoryName = item.travelCategoryName;
          const travelName = item.travelName;
          const travelId = item.travelId;

          if (!upperRegions[categoryName]) {
            upperRegions[categoryName] = [];
          }

          if (
            !upperRegions[categoryName].some(
              (region) => region.name === travelName
            )
          ) {
            upperRegions[categoryName].push({
              name: travelName,
              id: travelId,
            });
          }
        });
      }

      return {
        상위지역: upperRegions,
        하위지역: {},
      };
    },
    enabled: isOpen,
    staleTime: 1000 * 60 * 5, // 캐싱 시간 설정 (5분)
  });

  if (!isOpen) return null;

  const handleUpperRegionClick = (regionName) => {
    setSelectedUpperRegion(regionName);
    setSelectedLowerRegion(null); // 상위 지역 변경 시 하위 지역 초기화
  };

  const handleLowerRegionClick = (region) => {
    setSelectedLowerRegion(region);
  };

  const handleConfirm = () => {
    if (selectedUpperRegion && selectedLowerRegion) {
      onLocationSelect({
        // selectedLowerRegion이 객체이므로 바로 사용
        name: `${selectedUpperRegion} ${selectedLowerRegion.name}`,
        id: selectedLowerRegion.id,
      });
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedUpperRegion("");
    setSelectedLowerRegion(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-lg shadow-xl w-[500px] mx-4 max-h-[600px] overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        <div
          className="p-4 max-h-[450px] overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 font-pretendard">
              상위 지역
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(regionData.상위지역).map((regionName) => (
                <button
                  key={regionName}
                  onClick={() => handleUpperRegionClick(regionName)}
                  className={`px-4 py-2 rounded-lg text-sm font-pretendard transition-colors ${selectedUpperRegion === regionName
                    ? "bg-main text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {regionName}
                </button>
              ))}
            </div>
          </div>

          {selectedUpperRegion && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 font-pretendard">
                {selectedUpperRegion} 하위 지역
              </h4>
              <div className="flex flex-wrap gap-2">
                {(regionData.상위지역[selectedUpperRegion] || []).map(
                  (subRegion) => (
                    <button
                      key={subRegion.id}
                      onClick={() => handleLowerRegionClick(subRegion)}
                      className={`px-4 py-2 rounded-lg text-sm font-pretendard transition-colors ${selectedLowerRegion?.id === subRegion.id
                        ? "bg-main text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {subRegion.name}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* 완료 버튼 */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleConfirm}
            disabled={!selectedUpperRegion || !selectedLowerRegion}
            className={`w-full py-3 rounded-lg font-pretendard transition-colors ${selectedUpperRegion && selectedLowerRegion
              ? "bg-main text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
