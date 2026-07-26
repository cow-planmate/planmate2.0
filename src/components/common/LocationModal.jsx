import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export default function LocationModal({
  isOpen,
  onClose,
  onLocationSelect,
  modalType, // "departure" 또는 "destination"
}) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL;

  // 📌 v2 API: fetch API를 통한 여행지 목록 조회 (디버깅 콘솔 로그 추가)
  const { data: destinations = [] } = useQuery({
    queryKey: ["destination"],
    queryFn: async () => {
      console.log(
        `[API Request] 여행지 목록 조회 요청 시도: ${BASE_URL}/api/destination`,
      );

      try {
        const res = await fetch(`${BASE_URL}/api/destination`);

        console.log(
          `[API Response Status] HTTP 상태 코드: ${res.status} (${res.statusText})`,
        );

        if (!res.ok) {
          console.error(
            `[API Error Response] 여행지 목록 조회 실패 - Status: ${res.status}`,
          );
          throw new Error("여행지 목록을 불러오는 데 실패했습니다.");
        }

        const data = await res.json();
        console.log("[API Raw Response Data] 백엔드 수신 원본 데이터:", data);

        // 📌 v2 DTO 명세 매핑: destinationId, destinationName
        const rawDestinations = data?.destinations || data || [];

        if (Array.isArray(rawDestinations)) {
          const mappedData = rawDestinations.map((item) => ({
            id: item.destinationId,
            name: item.destinationName,
          }));

          console.log(
            "[API Mapped Data] 프론트엔드 매핑 완료 데이터:",
            mappedData,
          );
          return mappedData;
        }

        console.warn(
          "[API Warning] 수신된 데이터가 배열 형태가 아닙니다:",
          rawDestinations,
        );
        return [];
      } catch (error) {
        console.error(
          "[API Network/Fetch Error] 여행지 목록 조회 중 예외 발생:",
          error,
        );
        throw error;
      }
    },
    enabled: isOpen,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });

  // 모달 닫힐 때 선택 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSelectedRegion(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRegionClick = (region) => {
    setSelectedRegion(region);
  };

  const handleConfirm = () => {
    if (selectedRegion) {
      onLocationSelect({
        name: selectedRegion.name,
        id: selectedRegion.id,
      });
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedRegion(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 백드롭 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-lg shadow-xl w-[500px] mx-4 max-h-[600px] overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl z-10"
        >
          ✕
        </button>

        <div
          className="p-6 max-h-[450px] overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 font-pretendard">
              여행지 선택
            </h3>

            <div className="flex flex-wrap gap-2">
              {destinations.map((region) => (
                <button
                  key={region.id}
                  onClick={() => handleRegionClick(region)}
                  className={`px-4 py-2 rounded-lg text-sm font-pretendard transition-colors ${
                    selectedRegion?.id === region.id
                      ? "bg-main text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 완료 버튼 */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleConfirm}
            disabled={!selectedRegion}
            className={`w-full py-3 rounded-lg font-pretendard transition-colors ${
              selectedRegion
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
