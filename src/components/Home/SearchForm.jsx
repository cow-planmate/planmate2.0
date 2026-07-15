import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faCalendar,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

function SearchForm({
  destinationName,
  onDestinationClick,
  dateRangeText,
  onCalendarClick,
  personCountText,
  onPersonCountClick,
  transportText,
  transportIcon,
  onTransportClick,
  isSubmitting,
  onSubmit,
}) {
  return (
    <div className="relative px-4 sm:px-6 lg:absolute lg:-bottom-1 lg:left-0 lg:right-0 lg:px-8">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-4 sm:p-6 mt-6 lg:mt-0 mb-8">
        <div className="grid gap-4 items-end grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {/* 여행지 */}
          <div className="block relative">
            <label className="text-gray-600 text-sm mb-1 font-pretendard whitespace-nowrap block">
              여행지
            </label>
            <input
              type="text"
              className="font-pretendard border-b-2 border-gray-300 pb-2 focus:border-blue-500 focus:outline-none w-full pr-8 cursor-pointer"
              placeholder="여행지 입력"
              value={destinationName}
              onClick={onDestinationClick}
              readOnly
            />
            <button
              className="absolute right-0 bottom-2"
              onClick={onDestinationClick}
              type="button"
            >
              <FontAwesomeIcon icon={faLocationDot} className="text-gray-400" />
            </button>
          </div>

          {/* 기간 */}
          <div className="block relative">
            <label className="text-gray-600 text-sm mb-1 font-pretendard whitespace-nowrap block">
              기간
            </label>
            <input
              type="text"
              className="border-b-2 border-gray-300 pb-2 focus:border-blue-500 focus:outline-none w-full pr-8 cursor-pointer font-pretendard"
              placeholder="날짜 선택"
              value={dateRangeText}
              onClick={onCalendarClick}
              readOnly
            />
            <button
              className="absolute right-0 bottom-2"
              onClick={onCalendarClick}
              type="button"
            >
              <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
            </button>
          </div>

          {/* 인원수 */}
          <div className="block relative">
            <label className="text-gray-600 text-sm mb-1 font-pretendard whitespace-nowrap block">
              인원수
            </label>
            <input
              type="text"
              className="font-pretendard border-b-2 border-gray-300 pb-2 focus:border-blue-500 focus:outline-none w-full pr-8 cursor-pointer"
              placeholder="인원수 선택"
              value={personCountText}
              onClick={onPersonCountClick}
              readOnly
            />
            <button
              className="absolute right-0 bottom-2"
              onClick={onPersonCountClick}
              type="button"
            >
              <FontAwesomeIcon icon={faUser} className="text-gray-400" />
            </button>
          </div>

          {/* 이동수단 */}
          <div className="block relative">
            <label className="text-gray-600 text-sm mb-1 font-pretendard whitespace-nowrap block">
              이동수단
            </label>
            <input
              type="text"
              className="font-pretendard border-b-2 border-gray-300 pb-2 focus:border-blue-500 focus:outline-none w-full pr-8 cursor-pointer"
              placeholder="이동수단 선택"
              value={transportText}
              onClick={onTransportClick}
              readOnly
            />
            <button
              className="absolute right-0 bottom-2"
              onClick={onTransportClick}
              type="button"
            >
              <FontAwesomeIcon icon={transportIcon} className="text-gray-400" />
            </button>
          </div>

          {/* 버튼 */}
          <div className="block">
            <button
              disabled={isSubmitting}
              className={`cursor-pointer transition-all ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#1344FF] hover:bg-blue-600"
              } text-white px-4 py-3 rounded-lg shadow-lg w-full font-pretendard`}
              onClick={onSubmit}
              type="button"
            >
              {isSubmitting ? "생성중..." : "일정생성"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchForm;
