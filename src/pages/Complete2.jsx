import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApiClient } from "../hooks/useApiClient";
import { getTimeSlotIndex } from "../utils/createUtils";

import { faCalendar, faMap } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Helmet } from "react-helmet";
import Navbar from "../components/common/Navbar";
import Loading from "../components/common/Loading";
import PlanInfo from "../components/Complete/PlanInfo";
import DaySelector from "../components/Complete/DaySelector";
import TimetableGrid from "../components/Complete/TimetableGrid";
import MapArea from "../components/Complete/MapArea";

import { ErrorToast } from "../components/common/Toast";

function App() {
  const BASE_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  const { get, isAuthenticated } = useApiClient();

  const [finishLoading, setFinishLoading] = useState(false);
  const [planFrame, setPlanFrame] = useState({});
  const [placeBlocks, setPlaceBlocks] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);

  const [activeTab, setActiveTab] = useState("timetable");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [touchStartPos, setTouchStartPos] = useState({ x: null, y: null });
  const [touchEndPos, setTouchEndPos] = useState({ x: null, y: null });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showTimetable = !isMobile || activeTab === "timetable";
  const showSidebar = !isMobile || activeTab === "recommend";

  // --- Swipe Handlers ---
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEndPos({ x: null, y: null });
    setTouchStartPos({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e) => {
    setTouchEndPos({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStartPos.x || !touchEndPos.x) return;

    const distanceX = touchStartPos.x - touchEndPos.x;
    const distanceY = touchStartPos.y - touchEndPos.y;

    // 가로 스와이프가 세로 스크롤보다 클 때만 동작하도록 확인
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      const isLeftSwipe = distanceX > minSwipeDistance;
      const isRightSwipe = distanceX < -minSwipeDistance;

      if (isMobile) {
        if (isLeftSwipe && activeTab === "timetable") {
          setActiveTab("recommend");
        }
        if (isRightSwipe && activeTab === "recommend") {
          setActiveTab("timetable");
        }
      }
    }
  };

  const sortByDate = (list) =>
    [...list].sort((a, b) => new Date(a.date) - new Date(b.date));

  function convertBlock(block) {
    const timeTableId = block?.timeTableId;
    const timeTableStartTime = timetables?.find(
      (t) => t.timeTableId === timeTableId,
    )?.timeTableStartTime;

    console.log(timetables);
    console.log(timeTableStartTime);
    const start = getTimeSlotIndex(timeTableStartTime, block?.blockStartTime);
    const duration = getTimeSlotIndex(
      block?.blockStartTime,
      block?.blockEndTime,
    );
    const blockId = block.blockId;
    console.log(start);
    console.log(duration);

    const place = {
      placeId: block.placeId,
      categoryId: block.placeCategoryId,
      url: block.placeLink,
      name: block.placeName,
      formatted_address: block.placeAddress,
      rating: block.placeRating,
      iconUrl: block.photoUrl || "./src/assets/imgs/default.png",
      photoUrl: block.photoUrl,
      xlocation: block.xLocation || block.xlocation,
      ylocation: block.yLocation || block.ylocation,
      memo: block.memo,
    };

    return { timeTableId, place, start, duration, blockId, memo: block.memo };
  }

  const addPlaceBlock = ({
    timeTableId,
    place,
    start,
    duration,
    blockId,
    memo,
  }) => {
    setPlaceBlocks((prev) => ({
      ...prev,
      [timeTableId]: [
        ...(prev[timeTableId] || []),
        {
          id: blockId,
          place,
          start,
          duration,
          memo,
        },
      ],
    }));
  };

  const [prevPlaces, setPrevPlaces] = useState(null);

  useEffect(() => {
    const addPlaceBlocks = () => {
      prevPlaces.map((item) => {
        console.log(item);
        const convert = convertBlock(item);
        addPlaceBlock(convert);
      });
    };
    console.log(timetables, prevPlaces);
    if (timetables && prevPlaces) {
      addPlaceBlocks();
    }
  }, [timetables, prevPlaces]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      let planData = null;
      if (token) {
        try {
          planData = await get(
            `${BASE_URL}/api/plan/${id}/complete?token=${token}`,
          );
        } catch (err) {
          console.error("일정 정보를 가져오는데 실패했습니다:", err);
          ErrorToast("잘못된 접근입니다.");
          navigate("/");
          return;
        }
      } else if (id && isAuthenticated()) {
        try {
          planData = await get(`${BASE_URL}/api/plan/${id}/complete`);
        } catch (err) {
          console.error("일정 정보를 가져오는데 실패했습니다:", err);
          ErrorToast("잘못된 접근입니다.");
          navigate("/");
          return;
        }
      } else {
        ErrorToast("잘못된 접근입니다.");
        navigate("/");
        return;
      }

      if (planData) {
        console.log("초기 데이터", planData);

        setPlanFrame(planData.planFrame);

        const sortTimetables = sortByDate(planData.timetables);
        setTimetables(sortTimetables);
        setSelectedDay(0);

        setPrevPlaces(planData.placeBlocks);

        setFinishLoading(true);
      }
    };

    fetchUserProfile();
  }, [id, get]);

  useEffect(() => {});

  if (!finishLoading) {
    return (
      <div className="font-pretendard h-screen">
        <div className="md:block hidden">
          <Navbar />
        </div>
        <Loading />
      </div>
    );
  }

  return (
    <div className="font-pretendard h-screen">
      <Helmet>
        <title>planMate : 여행 일정 결과</title>
        <meta
          name="description"
          content="완성된 여행 일정을 한눈에 확인하고 공유해보세요."
        />
      </Helmet>
      <div className="md:block hidden">
        <Navbar />
      </div>
      <PlanInfo planFrame={planFrame} />
      <div
        className="
          min-[1464px]:w-[1400px] min-[1464px]:px-0
          md:px-8 md:py-6 py-3
          mx-auto
          md:h-[calc(100vh-134px)]
          h-[calc(100vh-48px)]
        "
      >
        <div className="flex md:flex-row flex-col md:space-x-6 space-y-4 md:space-y-0 h-full">
          <DaySelector
            timetables={timetables}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />
          <div
            className="flex flex-1 flex-col h-full overflow-hidden select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="flex-1 flex overflow-hidden relative md:space-x-6">
              <TimetableGrid
                planFrame={planFrame}
                placeBlocks={placeBlocks}
                selectedDay={selectedDay}
                timetables={timetables}
                showTimetable={showTimetable}
              />
              <MapArea
                placeBlocks={placeBlocks}
                timetables={timetables}
                selectedDay={selectedDay}
                showSidebar={showSidebar}
              />
            </div>
            {isMobile && (
              <nav className="fixed left-0 right-0 bottom-0 z-40 bg-white border-t h-16 flex">
                <button
                  onClick={() => setActiveTab("timetable")}
                  className={`flex-1 flex flex-col items-center justify-center ${activeTab === "timetable" ? "text-main" : "text-gray-400"}`}
                >
                  <span className="text-xl">
                    <FontAwesomeIcon icon={faCalendar} />
                  </span>
                  <span className="text-xs font-medium">시간표</span>
                </button>
                <button
                  onClick={() => setActiveTab("recommend")}
                  className={`flex-1 flex flex-col items-center justify-center ${activeTab === "recommend" ? "text-main" : "text-gray-400"}`}
                >
                  <span className="text-xl">
                    <FontAwesomeIcon icon={faMap} />
                  </span>
                  <span className="text-xs font-medium">지도로 보기</span>
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
