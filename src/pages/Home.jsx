import { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { faBus, faCar } from "@fortawesome/free-solid-svg-icons";

// Components
import Navbar from "../components/common/Navbar";
import HeroSlider from "../components/Home/HeroSlider";
import SearchForm from "../components/Home/SearchForm";

// Modals
import DepartureModal from "../components/common/DepartureModal";
import DestinationModal from "../components/common/LocationModal";
import PersonCountModal from "../components/common/PersonCountModal";
import TransportModal from "../components/common/TransportModal";
import DateRangeModal from "../components/Home/HomeCal";
import { ErrorToast, WarningToast } from "../components/common/Toast";

// Hooks & Stores & Utils
import { useApiClient } from "../hooks/useApiClient";
import usePlanStore from "../store/Plan";
import useTimetableStore from "../store/Timetables";
import { formatDateForApi, getDatesBetween } from "../utils/homeDate";

function Home({ hideNavbar = false }) {
  const navigate = useNavigate();

  // Modals Visibility States
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPersonCountOpen, setIsPersonCountOpen] = useState(false);
  const [isTransportOpen, setIsTransportOpen] = useState(false);
  const [isDepartureOpen, setIsDepartureOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);

  // Form Data States
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

  // Handlers & Formatters
  const handleDateChange = (item) => setDateRange([item.selection]);

  const formatDateRange = () => {
    const start = dateRange[0].startDate?.toLocaleDateString("ko-KR") ?? "";
    const end = dateRange[0].endDate?.toLocaleDateString("ko-KR") ?? "";
    return `${start} ~ ${end}`;
  };

  const handleDepartureLocationSelect = (location) => {
    setDepartureLocation(location);
    setPlanField("departure", location?.name ?? "");
  };

  const handleDestinationLocationSelect = (location) =>
    setDestinationLocation(location);

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

  const makePlan = async () => {
    if (isSubmitting) return;

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

      {/* Hero Banner Section */}
      <HeroSlider />

      {/* Search Input Layout Form */}
      <SearchForm
        destinationName={destinationLocation ? destinationLocation.name : ""}
        onDestinationClick={() => setIsDestinationOpen(true)}
        dateRangeText={formatDateRange()}
        onCalendarClick={() => setIsCalendarOpen(true)}
        personCountText={formatPersonCount()}
        onPersonCountClick={() => setIsPersonCountOpen(true)}
        transportText={selectedTransport === "car" ? "자동차" : "대중교통"}
        transportIcon={selectedTransport === "car" ? faCar : faBus}
        onTransportClick={() => setIsTransportOpen(true)}
        isSubmitting={isSubmitting}
        onSubmit={makePlan}
      />

      <div className="hidden lg:block h-24" />

      {/* Modals Stack */}
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
        onTransportChange={setSelectedTransport}
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

export default Home;
