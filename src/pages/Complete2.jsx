import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApiClient } from "../hooks/useApiClient";
import { BLOCK_CATEGORY_TO_ID, getTimeSlotIndex } from "../utils/createUtils";

import { faCalendar, faMap } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Helmet } from "react-helmet";
import Navbar from "../components/planmate2/navbar";
import Loading from "../components/common/Loading";
import PlanInfo from "../components/Complete/PlanInfo";
import DaySelector from "../components/Complete/DaySelector";
import TimetableGrid from "../components/Complete/TimetableGrid";
import MapArea from "../components/Complete/MapArea";

import { ErrorToast } from "../components/common/Toast";
import { resolvePlanOwnership } from "../utils/planOwnership";
import { ChecklistSheet } from "../components/checklist/ChecklistSheet";

function App() {
  const BASE_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { get, isAuthenticated } = useApiClient();

  const handleNavbarNavigate = (view) => {
    const routes = {
      feed: "/",
      community: "/community/free",
      create: "/create-post",
      mypage: "/mypage",
      "plan-maker": "/plan-maker",
      social: "/social",
    };

    navigate(routes[view] || "/");
  };

  const [finishLoading, setFinishLoading] = useState(false);
  const [planFrame, setPlanFrame] = useState({});
  const [placeBlocks, setPlaceBlocks] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

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
      categoryId: BLOCK_CATEGORY_TO_ID[block.blockCategory] ?? null,
      name: block.placeName,
      formatted_address: block.placeAddress,
      iconUrl: block.placeThumbnailUrl || "./src/assets/imgs/default.png",
      photoUrl: block.placeThumbnailUrl,
      xlocation: block.longitude,
      ylocation: block.latitude,
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
      if (id) {
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

        setIsOwner(
          await resolvePlanOwnership({
            planId: id,
            planData,
            get,
            baseUrl: BASE_URL,
            isAuthenticated,
          }),
        );

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
        <div>
          <Navbar currentView="" onNavigate={handleNavbarNavigate} />
        </div>
        <Loading />
      </div>
    );
  }

  return (
    <div className="font-pretendard min-h-screen bg-[#f6f7f9] text-slate-950">
      <Helmet>
        <title>planMate : 여행 일정 결과</title>
        <meta
          name="description"
          content="완성된 여행 일정을 한눈에 확인하고 공유해보세요."
        />
      </Helmet>
      <div>
        <Navbar currentView="" onNavigate={handleNavbarNavigate} />
      </div>
      <PlanInfo planFrame={planFrame} isOwner={isOwner} />
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <DaySelector
            timetables={timetables}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />
          <div
            className="select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
              <TimetableGrid
                planFrame={planFrame}
                placeBlocks={placeBlocks}
                selectedDay={selectedDay}
                timetables={timetables}
                showTimetable={showTimetable}
              />
              <aside className="space-y-4 lg:col-start-2 lg:row-start-1">
                <MapArea
                  placeBlocks={placeBlocks}
                  timetables={timetables}
                  selectedDay={selectedDay}
                  showSidebar={showSidebar}
                />
                <ChecklistSheet
                  planId={id}
                  enabled={isAuthenticated()}
                  variant="summary"
                />
              </aside>
            </div>
            {isMobile && (
              <nav className="fixed bottom-4 left-1/2 z-40 flex h-14 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur">
                <button
                  onClick={() => setActiveTab("timetable")}
                  aria-label="여정 보기"
                  className={`flex-1 flex items-center gap-2 justify-center rounded-xl text-sm font-semibold [&>span:last-child]:hidden after:content-['여정'] ${activeTab === "timetable" ? "bg-slate-950 text-white" : "text-slate-400"}`}
                >
                  <span className="text-xl">
                    <FontAwesomeIcon icon={faCalendar} />
                  </span>
                  <span className="text-xs font-medium">시간표</span>
                </button>
                <button
                  onClick={() => setActiveTab("recommend")}
                  aria-label="지도 보기"
                  className={`flex-1 flex items-center gap-2 justify-center rounded-xl text-sm font-semibold [&>span:last-child]:hidden after:content-['지도'] ${activeTab === "recommend" ? "bg-slate-950 text-white" : "text-slate-400"}`}
                >
                  <span className="text-xl">
                    <FontAwesomeIcon icon={faMap} />
                  </span>
                  <span className="text-xs font-medium">지도로 보기</span>
                </button>
              </nav>
            )}
          </div>
      </main>
    </div>
  );
}

export default App;
