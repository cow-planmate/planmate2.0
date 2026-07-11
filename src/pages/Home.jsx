import { useState } from "react";
import { Helmet } from "react-helmet";
import DepartureModal from "../components/common/DepartureModal";
import DestinationModal from "../components/common/LocationModal";
import Navbar from "../components/common/Navbar";
import PersonCountModal from "../components/common/PersonCountModal";
import TransportModal from "../components/common/TransportModal";
import DateRangeModal from "../components/Home/HomeCal";
import { useApiClient } from "../hooks/useApiClient";

import {
    faBus,
    faCalendar,
    faCar,
    faLocationDot,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useNavigate } from "react-router-dom";
import usePlanStore from "../store/Plan";

import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

import img1 from "../assets/imgs/img1.jpg";
import img2 from "../assets/imgs/img2.jpg";
import img3 from "../assets/imgs/img3.jpg";
import useTimetableStore from "../store/Timetables";
import { ErrorToast, WarningToast } from "../components/common/Toast";

function App({ hideNavbar = false }) {
  const navigate = useNavigate();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPersonCountOpen, setIsPersonCountOpen] = useState(false);
  const [isTransportOpen, setIsTransportOpen] = useState(false);
  const [isDepartureOpen, setIsDepartureOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);

  const [personCount, setPersonCount] = useState({ adults: 1, children: 0 });
  const [selectedTransport, setSelectedTransport] = useState("bus");
  const [departureLocation, setDepartureLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const { setPlanField, setPlanAll } = usePlanStore();
  const { setTimetableAll } = useTimetableStore();
  const { post, isAuthenticated } = useApiClient();

  const sliderHeightClass = "h-[14rem] sm:h-[20rem] lg:h-[36rem]";

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true,
    arrows: false,
    pauseOnHover: false,
    pauseOnFocus: false,
  };

  const handleDateChange = (item) => {
    setDateRange([item.selection]);
  };

  const formatDateRange = () => {
    const start = dateRange[0].startDate?.toLocaleDateString("ko-KR") ?? "";
    const end = dateRange[0].endDate?.toLocaleDateString("ko-KR") ?? "";
    return `${start} ~ ${end}`;
  };

  const handleDepartureLocationSelect = (location) => {
    setDepartureLocation(location);
    setPlanField("departure", location?.name ?? "");
  };

  const handleDestinationLocationSelect = (location) => {
    setDestinationLocation(location);
  };

  const handlePersonCountChange = (count) => {
    setPersonCount(count);
    setPlanField("adultCount", count.adults);
    setPlanField("childCount", count.children);
  };

  const formatPersonCount = () => {
    const total = personCount.adults + personCount.children;
    if (total === 0) return "인원수 선택";
    return `성인 ${personCount.adults}명, 어린이 ${personCount.children}명`;
  };

  const handleTransportChange = (transport) => {
    setSelectedTransport(transport);
  };

  const getTransportIcon = () => {
    return selectedTransport === "car" ? faCar : faBus;
  };

  const getTransportText = () => {
    return selectedTransport === "car" ? "자동차" : "대중교통";
  };

  const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDatesBetween = (start, end) => {
    const dateArray = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
  };

  const makePlan = async () => {
    if (isSubmitting) return; // 이미 요청 중이면 무시

    try {
      setIsSubmitting(true);

      if (
        !destinationLocation ||
        !dateRange[0].startDate ||
        !dateRange[0].endDate ||
        personCount.adults + personCount.children === 0
      ) {
        WarningToast("입력되지 않은 값이 있습니다.");
        return;
      }

      const allDates = getDatesBetween(
        dateRange[0].startDate,
        dateRange[0].endDate,
      );
      const formattedDates = allDates.map((date) => formatDateForApi(date));

      if (isAuthenticated()) {
        const requestData = {
          departure: "null",
          travelId: destinationLocation.id,
          dates: formattedDates,
          adultCount: Number(personCount.adults),
          childCount: Number(personCount.children),
          transportation: selectedTransport === "car" ? 1 : 0,
        };

        const BASE_URL = import.meta.env.VITE_API_URL;

        const data = await post(`${BASE_URL}/api/plan`, requestData);

        if (data && data.planId) {
          navigate(`/create?id=${data.planId}`);
        }
      } else {
        setPlanAll({
          planName:
            destinationLocation?.name.split(" ")[1] || "제목을 입력하세요",
          planId: -1,
          travelCategoryName: destinationLocation?.name.split(" ")[0] || "",
          travelName: destinationLocation?.name.split(" ")[1] || "",
          travelId: destinationLocation?.id || null,
          departure: departureLocation?.name || "",
          transportationCategoryId: selectedTransport === "car" ? 1 : 0,
          adultCount: Number(personCount.adults),
          childCount: Number(personCount.children),
        });

        const putTimetables = formattedDates.map((date, index) => ({
          timeTableId: index,
          date,
          timeTableStartTime: "09:00:00",
          timeTableEndTime: "20:00:00",
        }));
        setTimetableAll(putTimetables);
        navigate(`/create`);
      }
    } catch (err) {
      console.error("에러, 다시시도해주세요", err);
      ErrorToast("에러, 다시시도 해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full">
      <Helmet>
        <title>planMate : 동시협업 여행플래너</title>
        <meta
          name="description"
          content="planMate는 친구들과 여행 일정을 함께 만드는 실시간 협업 플래너입니다. 복잡한 계획 없이도 누구나 쉽고 빠르게 나만의 여행 일정을 완성해보세요."
        />
      </Helmet>

      {/* Navbar */}
      {!hideNavbar && (
        <div className="text-center h-auto font-pretendard">
          <Navbar isLogin={false} />
        </div>
      )}

      <div className="relative flex flex-col items-center overflow-hidden">
        <h1 className="sr-only">동시협업 여행 플래너 planMate</h1>
        <Slider {...settings} className={`w-full ${sliderHeightClass}`}>
          <div>
            <img
              src={img1}
              className={`w-full ${sliderHeightClass} object-cover`}
              alt="여행 일정 협업 플래너 planMate 메인 비주얼"
            />
          </div>
          <div>
            <img
              src={img2}
              className={`w-full ${sliderHeightClass} object-cover`}
              alt="동시에 함께 만드는 여행 스케줄"
            />
          </div>
          <div>
            <img
              src={img3}
              className={`w-full ${sliderHeightClass} object-cover`}
              alt="여행지와 기간으로 일정 생성"
            />
          </div>
        </Slider>

        {/* overlay */}
        <div
          className={`absolute top-0 left-0 right-0 ${sliderHeightClass} bg-gradient-to-b from-transparent to-black/60 pointer-events-none`}
        />

        <div className="absolute bottom-6 sm:bottom-12 lg:bottom-20 left-0 right-0 px-4 sm:px-6 lg:px-8 pointer-events-none">
          <div className="w-full max-w-7xl mx-auto">
            <div className="font-pretendard text-white font-bold text-left text-3xl sm:text-4xl lg:text-5xl leading-tight drop-shadow-md">
              <div className="mb-2 sm:mb-4">나다운, 우리다운</div>
              <div>여행의 시작</div>
            </div>
          </div>
        </div>
      </div>

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
                value={destinationLocation ? destinationLocation.name : ""}
                onClick={() => setIsDestinationOpen(true)}
                readOnly
              />
              <button
                className="absolute right-0 bottom-2"
                onClick={() => setIsDestinationOpen(true)}
                type="button"
              >
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-gray-400"
                />
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
                value={formatDateRange()}
                onClick={() => setIsCalendarOpen(true)}
                readOnly
              />
              <button
                className="absolute right-0 bottom-2"
                onClick={() => setIsCalendarOpen(true)}
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
                value={formatPersonCount()}
                onClick={() => setIsPersonCountOpen(true)}
                readOnly
              />
              <button
                className="absolute right-0 bottom-2"
                onClick={() => setIsPersonCountOpen(true)}
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
                value={getTransportText()}
                onClick={() => setIsTransportOpen(true)}
                readOnly
              />
              <button
                className="absolute right-0 bottom-2"
                onClick={() => setIsTransportOpen(true)}
                type="button"
              >
                <FontAwesomeIcon
                  icon={getTransportIcon()}
                  className="text-gray-400"
                />
              </button>
            </div>

            {/* 버튼 */}
            <div className="block">
              <button
                disabled={isSubmitting}
                className={`cursor-pointer transition-all 
    ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#1344FF] hover:bg-blue-600"} 
    text-white px-4 py-3 rounded-lg shadow-lg w-full font-pretendard`}
                onClick={makePlan}
                type="button"
              >
                {isSubmitting ? "생성중..." : "일정생성"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block h-24" />

      {/* Modals */}
      <DateRangeModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        dateRange={dateRange}
        onDateChange={handleDateChange}
      />

      <PersonCountModal
        isOpen={isPersonCountOpen}
        onClose={() => setIsPersonCountOpen(false)}
        personCount={personCount}
        onPersonCountChange={handlePersonCountChange}
      />

      <TransportModal
        isOpen={isTransportOpen}
        onClose={() => setIsTransportOpen(false)}
        selectedTransport={selectedTransport}
        onTransportChange={handleTransportChange}
      />

      <DepartureModal
        isOpen={isDepartureOpen}
        onClose={() => setIsDepartureOpen(false)}
        onLocationSelect={handleDepartureLocationSelect}
        title="출발지 검색"
        placeholder="출발지를 입력해주세요"
      />

      <DestinationModal
        isOpen={isDestinationOpen}
        onClose={() => setIsDestinationOpen(false)}
        onLocationSelect={handleDestinationLocationSelect}
        title="여행지 검색"
        placeholder="여행지를 입력해주세요"
      />
    </div>
  );
}

export default App;
