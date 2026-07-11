import { useEffect, useRef, useState } from "react";
import { SidebarItem } from "./SidebarItem";
import { useApiClient } from "../../../hooks/useApiClient";
import usePlacesStore from "../../../store/Places";
import { faCirclePlus, faUmbrellaBeach, faBed, faUtensils, faPenNib, faMagnifyingGlass, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoadingRing from "../../../assets/imgs/ring-resize.svg?react";
import useNicknameStore from "../../../store/Nickname";

export default function Sidebar({
  planId,
  isMobile,
  showSidebar,
  handleMobileAdd,
}) {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { get, post } = useApiClient();
  const store = usePlacesStore();
  const { search, setAddSearch, setAddNext, isLoading } = store;
  const { customPlaces, createCustomPlace, removeCustomPlace } = useNicknameStore();

  const [selectedTab, setSelectedTab] = useState("tour");
  const [searchText, setSearchText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);

  const [hasSearched, setHasSearched] = useState(false);
  const searchTimerRef = useRef(null);
  const lastSearchRef = useRef("");

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

  useEffect(() => {
    if (selectedTab !== "search") return;

    const q = searchText.trim();

    // 🔐 API 보호
    if (!q || q.length < 2 || !planId) {
      setHasSearched(false);
      setAddSearch({ search: [], searchNext: [] });
      return;
    }

    // debounce
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(async () => {
      if (lastSearchRef.current === q) return;
      lastSearchRef.current = q;

      try {
        setSearchLoading(true);

        const res = await get(
          `${BASE_URL}/api/plan/${planId}/place/${encodeURIComponent(q)}`
        );

        setAddSearch({
          search: Array.isArray(res?.places) ? res.places : [],
          searchNext: res.nextPageTokens,
        });

        setHasSearched(true); // ✅ 실제 검색 완료
      } catch (err) {
        console.error("검색 실패:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchText, selectedTab, planId]);

  const handleNext = async () => {
    const currentTab = selectedTab;
    const nextPageTokens = store[`${currentTab}Next`];
    console.log(nextPageTokens)
    try {
      setNextLoading(true);
      const res = await post(`${BASE_URL}/api/plan/nextplace`, {
        tokens: nextPageTokens,
      });
      setAddNext(currentTab, res.places, res.nextPageTokens);
    } catch (err) {
      console.error("실패!", err);
    } finally {
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
                className="flex-1 border rounded-md px-3 py-2"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchLoading && <LoadingRing className="w-6 h-6" />}
            </div>
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
              key={place.placeId}
              place={place}
              isMobile={isMobile}
              onMobileAdd={() => handleMobileAdd(place)}
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
                <p className="text-gray-400 text-xs mt-3">
                  검색 탭에서 장소를 직접 찾아볼 수 있어요!
                </p>
              </div>
            )}
          {selectedTab === "search" &&
            hasSearched &&
            !searchLoading &&
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
          {selectedTab !== "custom" && !isLoading &&
            ((selectedTab !== "search" || search.length !== 0) && store[`${selectedTab}Next`]?.length > 0) && (
              <div className="text-center py-3">
                <button
                  className="text-3xl text-main hover:text-mainDark"
                  onClick={handleNext}
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
    </div>
  );
}
