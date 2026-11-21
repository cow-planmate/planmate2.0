import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  destinationQueryKeys,
  fetchDestinationList,
  fetchDestinationTree,
  getCachedDestinationList,
  getCachedDestinationTree,
} from "../../utils/destinationCache";

const staleUntilFirstValidation = (query) =>
  query.state.dataUpdatedAt === 0 ? 0 : Infinity;

export default function LocationModal({
  isOpen,
  onClose,
  onLocationSelect,
  enableDetailView = false,
}) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [expandedSido, setExpandedSido] = useState(null);

  const {
    data: destinations = [],
    isLoading: isDestinationsLoading,
    isError: isDestinationsError,
  } = useQuery({
    queryKey: destinationQueryKeys.featured,
    queryFn: fetchDestinationList,
    initialData: getCachedDestinationList,
    initialDataUpdatedAt: 0,
    enabled: isOpen,
    staleTime: staleUntilFirstValidation,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const {
    data: destinationTree = [],
    isLoading: isTreeLoading,
    isError: isTreeError,
  } = useQuery({
    queryKey: destinationQueryKeys.tree,
    queryFn: fetchDestinationTree,
    initialData: getCachedDestinationTree,
    initialDataUpdatedAt: 0,
    enabled: isOpen && enableDetailView && isDetailView,
    staleTime: staleUntilFirstValidation,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // 모달 닫힐 때 선택 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSelectedRegion(null);
      setIsDetailView(false);
      setExpandedSido(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRegionClick = (region) => {
    setSelectedRegion(region);
  };

  const handleSidoClick = (sido) => {
    setSelectedRegion(sido);
    setExpandedSido(sido);
  };

  const handleDetailView = () => {
    setSelectedRegion(null);
    setIsDetailView(true);
    setExpandedSido(null);
  };

  const handleFeaturedView = () => {
    setSelectedRegion(null);
    setIsDetailView(false);
    setExpandedSido(null);
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
    setIsDetailView(false);
    setExpandedSido(null);
    onClose();
  };

  const isLoading = isDetailView
    ? isTreeLoading
    : isDestinationsLoading;
  const isError = isDetailView ? isTreeError : isDestinationsError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 백드롭 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-lg shadow-xl w-[500px] mx-4 max-h-[600px] overflow-hidden">
        <button
          type="button"
          onClick={handleClose}
          aria-label="여행지 선택 닫기"
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl z-10"
        >
          ✕
        </button>

        <div
          className="p-6 max-h-[450px] overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between gap-3 pr-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 font-pretendard">
                  여행지 선택
                </h3>
                {isDetailView && (
                  <p className="mt-1 text-xs text-gray-500 font-pretendard">
                    시·도만 선택해도 완료할 수 있습니다.
                  </p>
                )}
              </div>

              {enableDetailView && (
                <button
                  type="button"
                  onClick={isDetailView ? handleFeaturedView : handleDetailView}
                  className="shrink-0 rounded-lg border border-main px-3 py-1.5 text-xs font-medium text-main transition-colors hover:bg-blue-50 font-pretendard"
                >
                  {isDetailView ? "기본 목록" : "상세보기"}
                </button>
              )}
            </div>

            {isLoading && (
              <p className="py-8 text-center text-sm text-gray-500 font-pretendard">
                여행지 목록을 불러오는 중입니다.
              </p>
            )}

            {isError && (
              <p className="py-8 text-center text-sm text-red-500 font-pretendard">
                여행지 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
              </p>
            )}

            {!isLoading && !isError && !isDetailView && (
              <div className="flex flex-wrap gap-2">
                {destinations.map((region) => (
                  <button
                    type="button"
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
            )}

            {!isLoading && !isError && isDetailView && (
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-medium text-gray-500 font-pretendard">
                    시·도
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {destinationTree.map((sido) => (
                      <button
                        type="button"
                        key={sido.id}
                        onClick={() => handleSidoClick(sido)}
                        className={`px-4 py-2 rounded-lg text-sm font-pretendard transition-colors ${
                          selectedRegion?.id === sido.id
                            ? "bg-main text-white"
                            : expandedSido?.id === sido.id
                              ? "bg-blue-50 text-main ring-1 ring-main"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {sido.name}
                      </button>
                    ))}
                  </div>
                </div>

                {expandedSido && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-gray-500 font-pretendard">
                      {expandedSido.name} 하위 지역
                    </p>

                    {expandedSido.children.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {expandedSido.children.map((region) => (
                          <button
                            type="button"
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
                    ) : (
                      <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500 font-pretendard">
                        하위 지역이 없습니다. {expandedSido.name} 자체를 선택해
                        완료할 수 있습니다.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 완료 버튼 */}
        <div className="p-4 border-t border-gray-200">
          <button
            type="button"
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
