// components/common/DepartureModalModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faSearch,
  faTimes,
  faMapMarkerAlt,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useApiClient } from "../../hooks/useApiClient";

const DepartureModal = ({
  isOpen,
  onClose,
  onLocationSelect,
  title = "출발지 검색",
  placeholder = "출발지를 입력해주세요",
  onAuthError,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const inputRef = useRef(null);

  // API 클라이언트 훅 사용
  const { isLoading, error } = useApiClient();
  const BASE_URL = import.meta.env.VITE_API_URL;

  // 모달이 열릴 때 input에 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 검색 API 호출
  const searchDeparture = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/departure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ departureQuery: query }),
      });

      if (!response.ok) {
        throw new Error("검색 실패: " + response.status);
      }

      const data = await response.json();
      console.log(data);
      setSearchResults(data.departures || []);
    } catch (err) {
      console.error("검색 API 에러:", err);
      setSearchResults([]);
    }
  };
  // 검색어 변경 시 디바운싱 적용
  useEffect(() => {
    const timer = setTimeout(() => {
      searchDeparture(searchQuery);
      console.log(searchResults);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 검색어 입력 핸들러
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // 위치 선택 핸들러 - 전체 location 객체를 전달
  const handleLocationClick = (location) => {
    // 전체 location 객체를 그대로 전달 (placeId, url, departureName, departureAddress 포함)
    onLocationSelect({
      name: location.departureName,
    });
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 font-pretendard">
            {title}
          </h2>
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* 검색 입력 영역 */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-pretendard disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* 검색 결과 영역 */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600 font-pretendard">
                검색중...
              </span>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="p-6 text-center">
              <div
                className={`p-4 rounded-lg ${
                  error.includes("로그인") ||
                  error.includes("인증") ||
                  error.includes("권한")
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`font-pretendard ${
                    error.includes("로그인") ||
                    error.includes("인증") ||
                    error.includes("권한")
                      ? "text-yellow-700"
                      : "text-red-600"
                  }`}
                >
                  {error}
                </p>
              </div>
            </div>
          )}

          {!isLoading &&
            !error &&
            searchQuery &&
            searchResults.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-gray-500 font-pretendard">
                  검색 결과가 없습니다.
                </p>
              </div>
            )}

          {!isLoading && !error && searchResults.length > 0 && (
            <div className="py-2">
              {searchResults.map((location, index) => (
                <button
                  key={location.placeId || index}
                  onClick={() => handleLocationClick(location)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 group"
                >
                  <div className="flex items-start space-x-3">
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="text-blue-500 mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      {/* 장소명 */}
                      <p className="font-semibold text-gray-800 font-pretendard truncate">
                        {location.departureName}
                      </p>

                      {/* 주소 */}
                      {location.departureAddress && (
                        <div className="flex items-center mt-1">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="text-gray-400 text-xs mr-1"
                          />
                          <p className="text-sm text-gray-600 font-pretendard truncate">
                            {location.departureAddress}
                          </p>
                        </div>
                      )}

                      {/* URL이 있는 경우 외부 링크 버튼 */}
                      {location.url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // 부모 버튼 클릭 방지
                            window.open(location.url, "_blank");
                          }}
                          className="flex items-center mt-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faExternalLinkAlt}
                            className="text-xs mr-1"
                          />
                          <span className="text-xs font-pretendard">
                            상세 정보 보기(Google Map)
                          </span>
                        </button>
                      )}
                    </div>

                    {/* 호버 시 선택 화살표 */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!searchQuery && !error && (
            <div className="p-6 text-center">
              <FontAwesomeIcon
                icon={faLocationDot}
                className="text-gray-300 text-4xl mb-4"
              />
              <p className="text-gray-500 font-pretendard">
                위치를 검색해보세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartureModal;
