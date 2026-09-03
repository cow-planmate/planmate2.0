import { useEffect, useRef, useState } from "react";
import { SidebarItem } from "./SidebarItem";
import { useApiClient } from "../../../hooks/useApiClient";
import usePlacesStore from "../../../store/Places";
import usePlanStore from "../../../store/Plan";
import { mapPlaceSummary, mapTextSearchResult } from "../../../utils/createUtils";
import { faCirclePlus, faUmbrellaBeach, faBed, faUtensils, faPenNib, faMagnifyingGlass, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoadingRing from "../../../assets/imgs/ring-resize.svg?react";
import useNicknameStore from "../../../store/Nickname";
import PlaceDetailModal from "./PlaceDetailModal";

const SEARCH_TIMEOUT_MS = 12000;

export default function Sidebar({
  planId,
  isMobile,
  showSidebar,
  handleMobileAdd,
}) {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { get, post, apiRequest } = useApiClient();
  const store = usePlacesStore();
  const { search, setAddSearch, setAddNext, isLoading } = store;
  const { destinationId } = usePlanStore();
  const { customPlaces, createCustomPlace, removeCustomPlace } = useNicknameStore();

  // 관광지/숙소/식당 탭 -> GET /api/place의 category 파라미터 매핑
  const CATEGORY_PARAM = {
    tour: "ATTRACTION",
    lodging: "ACCOMMODATION",
    restaurant: "RESTAURANT",
  };

  const [selectedTab, setSelectedTab] = useState("tour");
  const [searchText, setSearchText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [nextLoading, setNextLoading] = useState(false);
  const [detailPlace, setDetailPlace] = useState(null);
  const nextRequestInFlightRef = useRef(false);

  const [hasSearched, setHasSearched] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const searchTimerRef = useRef(null);
  const lastSearchRef = useRef("");
  const searchRequestIdRef = useRef(0);

  const tabSelectedClass = {
    tour: "bg-lime-700 text-white",
    lodging: "bg-orange-700 text-white",
    restaurant: "bg-blue-700 text-white",
    custom: "bg-violet-700 text-white",
    search: "bg-gray-700 text-white",
  };
  const koreanName = {
    tour: "관광지",
    lodging: "숙소",
    restaurant: "식당",
    custom: "직접 추가",
    search: "검색",
  };

  const [customPlaceName, setCustomPlaceName] = useState("");

  const currentPlaces =
    selectedTab === "weather"
      ? []
      : selectedTab === "custom"
        ? customPlaces[planId]
        : (store[selectedTab] ?? []);

  const handleCustomAdd = () => {
    const name = customPlaceName.trim();
    if (!name) return;
    createCustomPlace(planId, name)
    setCustomPlaceName("");
  };

  // 입력이 잠시 멈추면 Google Places Text Search를 호출한다.
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (selectedTab !== "search") {
      searchRequestIdRef.current += 1;
      setSearchLoading(false);
      return;
    }

    const q = searchText.trim();
    if (q.length < 2) {
      searchRequestIdRef.current += 1;
      lastSearchRef.current = "";
      setHasSearched(false);
      setSearchError("");
      setSearchLoading(false);
      setAddSearch({ search: [], searchNext: null });
      return;
    }

    if (lastSearchRef.current === q) return;

    setHasSearched(false);
    setSearchError("");
    setAddSearch({ search: [], searchNext: null });
    const requestId = ++searchRequestIdRef.current;
    const controller = new AbortController();

    searchTimerRef.current = setTimeout(async () => {
      lastSearchRef.current = q;
      const timeoutId = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

      try {
        setSearchLoading(true);
        const params = new URLSearchParams({ query: q });
        if (destinationId != null) {
          params.set("destinationId", String(destinationId));
        }
        const res = await apiRequest(`${BASE_URL}/api/place/text-search?${params}`, {
          method: "GET",
          signal: controller.signal,
        });
        if (searchRequestIdRef.current !== requestId) return;

        setAddSearch({
          search: (res?.places ?? []).map(mapTextSearchResult),
          searchNext: res?.nextPageToken ?? null,
        });
        setHasSearched(true);
      } catch (err) {
        if (searchRequestIdRef.current !== requestId) return;
        console.error("검색 실패:", err);
        lastSearchRef.current = "";
        setSearchError(
          err?.name === "AbortError"
            ? "검색 응답이 늦어지고 있어 요청을 중단했습니다. 잠시 후 다시 시도해 주세요."
            : err.message || "장소 검색에 실패했습니다.",
        );
        setHasSearched(true);
      } finally {
        clearTimeout(timeoutId);
        if (searchRequestIdRef.current === requestId) setSearchLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(searchTimerRef.current);
      controller.abort();
    };
  }, [BASE_URL, destinationId, apiRequest, searchText, searchTrigger, selectedTab, setAddSearch]);

  const handleSearch = () => {
    if (searchText.trim().length < 2 || searchLoading) return;
    lastSearchRef.current = "";
    setSearchTrigger((value) => value + 1);
  };

  const handleNext = async () => {
    if (nextRequestInFlightRef.current) return;

    const currentTab = selectedTab;
    const nextPage = store[`${currentTab}Next`];
    if (!nextPage) return;
    try {
      nextRequestInFlightRef.current = true;
      setNextLoading(true);
      if (currentTab === "search") {
        const query = lastSearchRef.current;
        const res = await post(`${BASE_URL}/api/place/text-search/next`, {
          query,
          pageToken: nextPage,
        });
        // 다음 페이지를 기다리는 동안 검색어가 바뀌었으면 이전 결과를 섞지 않는다.
        if (lastSearchRef.current !== query) return;
        setAddNext(
          "search",
          (res?.places ?? []).map(mapTextSearchResult),
          res?.nextPageToken ?? null,
        );
        return;
      }
      const res = await get(
        `${BASE_URL}/api/place?destinationId=${destinationId}&category=${CATEGORY_PARAM[currentTab]}&page=${nextPage}&size=20`,
      );
      setAddNext(
        currentTab,
        res.places.map(mapPlaceSummary),
        res.hasNext ? nextPage + 1 : null,
      );
    } catch (err) {
      console.error("실패!", err);
    } finally {
      nextRequestInFlightRef.current = false;
      setNextLoading(false);
    }
  };

  return (
    <div
      className={`flex-1 w-full flex flex-col min-h-0 overflow-hidden transition-transform duration-300 absolute inset-0 md:relative md:transform-none z-20 
      ${showSidebar ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}
    >
      <div className="flex space-x-1 overflow-x-auto shrink-0 px-5 md:px-0">
        {["tour", "lodging", "restaurant", "custom", "search"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg md:rounded-none md:rounded-t-lg text-sm md:text-base text-nowrap ${selectedTab === tab
              ? tabSelectedClass[tab]
              : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => setSelectedTab(tab)}
          >
            {koreanName[tab]}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 flex flex-col md:border md:border-gray-300 rounded-lg rounded-tl-none divide-y divide-gray-300 md:min-h-0">
        {selectedTab === "search" && (
          <div className="px-5 py-2 shrink-0">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="장소를 입력하세요 (2글자 이상)"
                className="flex-1 border rounded-md px-3 py-2 min-w-0"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                aria-label="장소 검색"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searchText.trim().length < 2 || searchLoading}
                className="h-10 min-w-16 rounded-md bg-gray-700 px-4 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {searchLoading ? <LoadingRing className="mx-auto h-5 w-5" /> : "검색"}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              두 글자 이상 입력 시 자동으로 검색됩니다.
            </p>
          </div>
        )}
        {selectedTab === "custom" && (
          <div className="px-5 py-2 shrink-0">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="장소 이름을 입력하세요"
                className="flex-1 border rounded-md px-3 py-2 min-w-0"
                value={customPlaceName}
                onChange={(e) => setCustomPlaceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCustomAdd();
                }}
              />
              <button
                className="px-4 py-2 rounded-md bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleCustomAdd}
                disabled={!customPlaceName.trim()}
              >
                추가
              </button>
            </div>
          </div>
        )}
        <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden divide-y divide-gray-300`}>
          {!(isLoading && ["tour", "lodging", "restaurant"].includes(selectedTab)) && currentPlaces?.map((place) => (
            <SidebarItem
              key={`${selectedTab}-${place.placeId}`}
              place={place}
              sourceCategory={selectedTab}
              isMobile={isMobile}
              onMobileAdd={() => handleMobileAdd(place)}
              onShowDetail={
                ["tour", "lodging", "restaurant"].includes(selectedTab) && place.placeId
                  ? () => setDetailPlace(place)
                  : undefined
              }
              onDelete={
                selectedTab === "custom"
                  ? () => removeCustomPlace(planId, place.placeId)
                  : undefined
              }
            />
          ))}
          {selectedTab === "custom" && (currentPlaces?.length === 0 || !currentPlaces) && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center break-keep mt-4">
              <div className="text-5xl mb-5 opacity-90 drop-shadow-sm text-violet-500">
                <FontAwesomeIcon icon={faPenNib} />
              </div>
              <p className="text-gray-600 text-[15px] leading-relaxed font-medium mb-1">
                위 입력란에 장소 이름을 입력하고 <br />
                <span className="text-violet-600 font-bold">&quot;추가&quot;</span> 버튼을 눌러보세요.
              </p>
              <p className="text-gray-500 text-xs mt-4 bg-gray-100 px-3 py-1.5 rounded-full inline-block">
                <FontAwesomeIcon icon={faLightbulb} className="mr-1" /> 추가된 장소는 현재 기기에만 저장돼요
              </p>
            </div>
          )}
          {["tour", "lodging", "restaurant"].includes(selectedTab) &&
            isLoading && (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center break-keep mt-4">
                <div className={`
                  mb-5 flex items-center justify-center
                `}>
                  <LoadingRing className="w-16 h-16" />
                </div>
                <p className="text-gray-600 text-[15px] font-medium">
                  {koreanName[selectedTab]} 추천장소를 불러오고 있어요.
                </p>
                <p className="text-gray-400 text-xs mt-3">
                  잠시만 기다려주세요!
                </p>
              </div>
            )}
          {["tour", "lodging", "restaurant"].includes(selectedTab) &&
            !isLoading &&
            currentPlaces?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center break-keep mt-4">
                <div className={`
                  text-5xl mb-5 opacity-90 drop-shadow-sm 
                  ${selectedTab === "tour" ? "text-lime-500" : selectedTab === "lodging" ? "text-orange-500" : "text-blue-500"}
                `}>
                  <FontAwesomeIcon
                    icon={
                      selectedTab === "tour"
                        ? faUmbrellaBeach
                        : selectedTab === "lodging"
                          ? faBed
                          : faUtensils
                    }
                  />
                </div>
                <p className="text-gray-600 text-[15px] font-medium">
                  {koreanName[selectedTab]} 추천장소가 존재하지 않아요.
                </p>
              </div>
            )}
          {selectedTab === "search" && searchError && !searchLoading && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center break-keep mt-4">
              <div className="text-5xl mb-5 opacity-90 drop-shadow-sm text-red-400">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </div>
              <p className="text-gray-600 text-[15px] font-medium">
                장소 검색에 실패했습니다.
              </p>
              <p className="text-gray-400 text-xs mt-3">{searchError}</p>
            </div>
          )}
          {selectedTab === "search" &&
            hasSearched &&
            !searchLoading &&
            !searchError &&
            search.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center break-keep mt-4">
                <div className="text-5xl mb-5 opacity-90 drop-shadow-sm text-gray-400">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </div>
                <p className="text-gray-600 text-[15px] font-medium">
                  검색 결과가 없습니다.
                </p>
                <p className="text-gray-400 text-xs mt-3">
                  다른 키워드로 장소를 다시 찾아보세요.
                </p>
              </div>
            )}
          {!["custom", "search"].includes(selectedTab) && !isLoading && !searchLoading &&
            store[`${selectedTab}Next`] && (
              <div className="text-center py-3">
                <button
                  className="text-3xl text-main hover:text-mainDark"
                  onClick={handleNext}
                  disabled={nextLoading}
                  aria-label="추천 장소 더보기"
                >
                  {nextLoading ? (
                    <LoadingRing className="w-[30px]" />
                  ) : (
                    <FontAwesomeIcon icon={faCirclePlus} />
                  )}
                </button>
              </div>
            )}
        </div>
        <div className="h-12 block md:hidden" />
      </div>
      {detailPlace && (
        <PlaceDetailModal
          contentId={detailPlace.placeId}
          fallbackPlace={detailPlace}
          onClose={() => setDetailPlace(null)}
        />
      )}
    </div>
  );
}
