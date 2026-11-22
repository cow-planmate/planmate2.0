import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, MapPin, Search, X } from "lucide-react";
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
  const [expandedSido, setExpandedSido] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    enabled: isOpen && enableDetailView,
    staleTime: staleUntilFirstValidation,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!isOpen) {
      setSelectedRegion(null);
      setExpandedSido(null);
      setSearchQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRegionClick = (region) => {
    setSelectedRegion(region);
  };

  const handleSidoClick = (sido) => {
    setExpandedSido(sido);
    setSelectedRegion(null);
  };

  const handleClose = () => {
    setSelectedRegion(null);
    setExpandedSido(null);
    setSearchQuery("");
    onClose();
  };

  const handleSearchResultClick = (region, parentSido) => {
    setSelectedRegion(region);
    setExpandedSido(parentSido ?? region);
  };

  const handleConfirm = () => {
    if (!selectedRegion) return;

    onLocationSelect({
      name: selectedRegion.name,
      id: selectedRegion.id,
    });
    onClose();
  };

  const isSelectedChild = expandedSido?.children.some(
    (region) => region.id === selectedRegion?.id,
  );
  const selectionText = !selectedRegion
    ? "선택한 지역이 없습니다"
    : isSelectedChild
      ? `${expandedSido.name} · ${selectedRegion.name}`
      : selectedRegion.id === expandedSido?.id
        ? `${selectedRegion.name} 전체`
        : selectedRegion.name;

  const modalWidth = enableDetailView ? "w-[720px]" : "w-[500px]";
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ko-KR");
  const searchResults = normalizedQuery
    ? destinationTree.flatMap((sido) => {
        const results = [];

        if (sido.name.toLocaleLowerCase("ko-KR").includes(normalizedQuery)) {
          results.push({ region: sido, parentSido: null });
        }

        sido.children.forEach((region) => {
          if (
            region.name.toLocaleLowerCase("ko-KR").includes(normalizedQuery)
          ) {
            results.push({ region, parentSido: sido });
          }
        });

        return results;
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 font-pretendard sm:px-4">
      <button
        type="button"
        className="fixed inset-0 bg-black/50"
        onClick={handleClose}
        aria-label="여행지 선택 닫기"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
        className={`relative flex max-h-[calc(100vh-2rem)] max-w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${modalWidth}`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div>
            <h2
              id="location-modal-title"
              className="text-xl font-bold tracking-[-0.02em] text-slate-950"
            >
              {enableDetailView ? "어디로 여행을 떠날까요?" : "여행지 선택"}
            </h2>
            {enableDetailView && (
              <p className="mt-1.5 text-sm leading-5 text-slate-500">
                시·도를 고른 뒤 원하는 지역을 선택해 주세요.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="여행지 선택 닫기"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-main"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        {enableDetailView ? (
          <>
            <div className="shrink-0 px-5 pb-5 sm:px-6">
              <label
                htmlFor="location-search"
                className="mb-2 block text-sm font-semibold text-slate-600"
              >
                지역 검색
              </label>
              <div className="flex min-h-12 items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-3.5 transition focus-within:border-main focus-within:ring-2 focus-within:ring-blue-100">
                <Search className="size-5 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  id="location-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="시·도 또는 세부 지역을 검색해 주세요"
                  autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="검색어 지우기"
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-main"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {normalizedQuery ? (
              <div className="min-h-0 flex-1 overflow-y-auto border-t border-slate-200 px-5 py-5 sm:px-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-700">
                    검색 결과
                  </p>
                  {!isTreeLoading && !isTreeError && (
                    <span className="text-sm text-slate-500" aria-live="polite">
                      {searchResults.length}개
                    </span>
                  )}
                </div>

                {isTreeLoading && (
                  <p className="py-10 text-center text-sm text-slate-500">
                    지역 목록을 불러오는 중입니다.
                  </p>
                )}
                {isTreeError && (
                  <p className="py-10 text-center text-sm text-red-500">
                    지역 목록을 불러오지 못했습니다.
                  </p>
                )}
                {!isTreeLoading && !isTreeError && searchResults.length === 0 && (
                  <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Search className="size-6" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-base font-semibold text-slate-800">
                      일치하는 지역이 없습니다
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      다른 지역명으로 다시 검색해 주세요.
                    </p>
                  </div>
                )}
                {!isTreeLoading && !isTreeError && searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map(({ region, parentSido }) => {
                      const isSelected = selectedRegion?.id === region.id;

                      return (
                        <button
                          type="button"
                          key={region.id}
                          onClick={() =>
                            handleSearchResultClick(region, parentSido)
                          }
                          aria-pressed={isSelected}
                          className={`flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-main focus-visible:ring-offset-1 ${
                            isSelected
                              ? "border-main bg-blue-50"
                              : "border-slate-200 bg-white hover:border-main hover:bg-blue-50/60"
                          }`}
                        >
                          <span
                            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                              isSelected
                                ? "bg-main text-white"
                                : "bg-blue-50 text-main"
                            }`}
                          >
                            {isSelected ? (
                              <Check className="size-5" aria-hidden="true" />
                            ) : (
                              <MapPin className="size-5" aria-hidden="true" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-base font-semibold text-slate-900">
                              {region.name}
                            </span>
                            <span className="mt-0.5 block text-sm text-slate-500">
                              {parentSido
                                ? parentSido.name
                                : "시·도 전체"}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
            <div className="shrink-0 border-b border-slate-200 px-5 pb-5 sm:px-6">
              <p className="mb-2.5 text-sm font-semibold text-slate-600">
                인기 여행지
              </p>
              {isDestinationsLoading && (
                <p className="py-2 text-sm text-slate-500">
                  인기 여행지를 불러오는 중입니다.
                </p>
              )}
              {isDestinationsError && (
                <p className="py-2 text-sm text-red-500">
                  인기 여행지를 불러오지 못했습니다.
                </p>
              )}
              {!isDestinationsLoading && !isDestinationsError && (
                <div className="flex flex-wrap gap-2">
                  {destinations.map((region) => {
                    const isSelected = selectedRegion?.id === region.id;

                    return (
                      <button
                        type="button"
                        key={region.id}
                        onClick={() => handleRegionClick(region)}
                        aria-pressed={isSelected}
                        className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-main focus-visible:ring-offset-2 ${
                          isSelected
                            ? "border-main bg-main text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-main hover:bg-blue-50 hover:text-main"
                        }`}
                      >
                        {region.name}
                        {isSelected && (
                          <Check className="size-4" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto sm:grid-cols-[170px_minmax(0,1fr)] sm:overflow-hidden">
              <nav
                aria-label="시·도 목록"
                className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:overflow-y-auto sm:border-b-0 sm:border-r"
              >
                <p className="mb-2 px-2 text-sm font-semibold text-slate-500">
                  시·도
                </p>
                {isTreeLoading && (
                  <p className="px-2 py-3 text-sm text-slate-500">
                    지역을 불러오는 중입니다.
                  </p>
                )}
                {isTreeError && (
                  <p className="px-2 py-3 text-sm leading-5 text-red-500">
                    지역 목록을 불러오지 못했습니다.
                  </p>
                )}
                {!isTreeLoading && !isTreeError && (
                  <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-col sm:overflow-visible sm:pb-0">
                    {destinationTree.map((sido) => {
                      const isExpanded = expandedSido?.id === sido.id;

                      return (
                        <button
                          type="button"
                          key={sido.id}
                          onClick={() => handleSidoClick(sido)}
                          aria-current={isExpanded ? "true" : undefined}
                          className={`min-h-11 shrink-0 rounded-xl px-3 text-left text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-main sm:w-full ${
                            isExpanded
                              ? "bg-white text-main shadow-sm ring-1 ring-slate-200"
                              : "text-slate-700 hover:bg-white hover:text-main"
                          }`}
                        >
                          {sido.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </nav>

              <div className="min-h-[250px] p-5 sm:overflow-y-auto sm:p-6">
                {!expandedSido && !isTreeLoading && !isTreeError && (
                  <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-main">
                      <MapPin className="size-6" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-base font-semibold text-slate-800">
                      시·도를 선택해 주세요
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      선택한 지역의 세부 지역을 확인할 수 있어요.
                    </p>
                  </div>
                )}

                {expandedSido && (
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">
                          세부 지역
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-slate-950">
                          {expandedSido.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRegionClick(expandedSido)}
                        aria-pressed={selectedRegion?.id === expandedSido.id}
                        className={`min-h-11 shrink-0 rounded-xl border px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-main ${
                          selectedRegion?.id === expandedSido.id
                            ? "border-main bg-main text-white"
                            : "border-blue-200 bg-blue-50 text-main hover:border-main"
                        }`}
                      >
                        {expandedSido.name} 전체
                      </button>
                    </div>

                    {expandedSido.children.length > 0 ? (
                      <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-3">
                        {expandedSido.children.map((region) => {
                          const isSelected = selectedRegion?.id === region.id;

                          return (
                            <button
                              type="button"
                              key={region.id}
                              onClick={() => handleRegionClick(region)}
                              aria-pressed={isSelected}
                              className={`flex min-h-12 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-main focus-visible:ring-offset-1 ${
                                isSelected
                                  ? "border-main bg-main text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-main hover:bg-blue-50 hover:text-main"
                              }`}
                            >
                              {region.name}
                              {isSelected && (
                                <Check className="size-4" aria-hidden="true" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-5 text-slate-500">
                        세부 지역이 없습니다. 오른쪽 위의 전체 선택을 이용해
                        주세요.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
              </>
            )}
          </>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-6">
            {isDestinationsLoading && (
              <p className="py-8 text-center text-sm text-slate-500">
                여행지 목록을 불러오는 중입니다.
              </p>
            )}
            {isDestinationsError && (
              <p className="py-8 text-center text-sm text-red-500">
                여행지 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
              </p>
            )}
            {!isDestinationsLoading && !isDestinationsError && (
              <div className="flex flex-wrap gap-2">
                {destinations.map((region) => (
                  <button
                    type="button"
                    key={region.id}
                    onClick={() => handleRegionClick(region)}
                    className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition-colors ${
                      selectedRegion?.id === region.id
                        ? "bg-main text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
          {enableDetailView && (
            <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
              <MapPin className="size-4 shrink-0 text-main" aria-hidden="true" />
              <span className="truncate">{selectionText}</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedRegion}
            className={`min-h-12 rounded-xl px-5 font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-main focus-visible:ring-offset-2 ${
              enableDetailView ? "ml-auto shrink-0" : "w-full"
            } ${
              selectedRegion
                ? "bg-main text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            {selectedRegion ? `${selectedRegion.name} 선택` : "지역을 선택해 주세요"}
          </button>
        </footer>
      </section>
    </div>
  );
}
