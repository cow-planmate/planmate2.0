import { useState, useEffect, useRef } from "react"; // useRef 추가
import Navbar from "../components/common/Navbar";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApiClient } from "../hooks/useApiClient";
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import useKakaoLoader from "../hooks/useKakaoLoader";
import ShareModal from "../components/common/ShareModal";
import axios from "axios";

// AI 서버 URL
const AI_API_URL = import.meta.env.VITE_AI_API_URL;

// 날씨 설명(텍스트)을 기반으로 아이콘 반환 (DaySelector와 동일)
const getWeatherIcon = (description) => {
  if (!description) return "❓";
  const desc = description.toLowerCase();

  if (desc.includes("맑음")) return "☀️";
  if (desc.includes("구름") || desc.includes("흐림")) {
    if (
      desc.includes("조금") ||
      desc.includes("약간") ||
      desc.includes("부분")
    ) {
      return "🌤️";
    }
    return "☁️";
  }
  if (desc.includes("비") || desc.includes("소나기")) {
    if (desc.includes("약한") || desc.includes("가벼운")) {
      return "🌦️";
    }
    return "🌧️";
  }
  if (desc.includes("눈")) return "❄️";
  if (desc.includes("안개")) return "🌫️";
  if (desc.includes("뇌우")) return "⛈️";

  return "🌤️";
};

const TravelPlannerApp = () => {
  const { get } = useApiClient();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState(null);
  const [timetables, setTimetables] = useState([]);
  const tripCategory = { 0: "관광지", 1: "숙소", 2: "식당", 4: "검색" };
  const [transformedData, setTransformedData] = useState(null);
  const [schedule, setSchedule] = useState({});
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_URL;
  const [selectedDay, setSelectedDay] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // --- 날씨 State ---
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  // [수정] 날씨 중복 호출 방지용 Ref
  const lastWeatherFetchParams = useRef(null);

  useKakaoLoader();

  const [map, setMap] = useState();
  const [positions, setPositions] = useState([{ lat: 37.5665, lng: 126.978 }]);
  const [sortedState, setSortedState] = useState({});

  // transformApiResponse 함수 (원본 전체 유지)
  const transformApiResponse = (apiResponse) => {
    const { placeBlocks, timetables } = apiResponse;
    const result = {};
    timetables.forEach((timetable) => {
      result[timetable.timetableId] = [];
    });
    placeBlocks.forEach((place) => {
      const startTime = new Date(`2000-01-01T${place.startTime}`);
      const endTime = new Date(`2000-01-01T${place.endTime}`);
      const durationMinutes = (endTime - startTime) / (1000 * 60);
      const duration = Math.round(durationMinutes / 15);
      const timeSlot = place.startTime.substring(0, 5);
      const urlMatch = place.placeLink.match(/place_id:([^&]+)/);
      const placeId = urlMatch ? urlMatch[1] : "";
      let iconUrl;
      if (place.placeCategory === 0) {
        iconUrl =
          "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/park-71.png";
      } else if (place.placeCategory === 1) {
        iconUrl =
          "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/lodging-71.png";
      } else {
        iconUrl =
          "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png";
      }
      const transformedPlace = {
        placeId: placeId,
        url: place.placeLink,
        name: place.placeName,
        formatted_address: place.placeAddress,
        rating: place.placeRating,
        iconUrl: iconUrl,
        categoryId: place.placeCategory,
        xlocation: place.xlocation || 0,
        ylocation: place.ylocation || 0,
        timeSlot: timeSlot,
        duration: duration,
        memo: place.memo,
      };
      const targetTimetableId = place.timetableId ?? place.timeTableId;
      if (result[targetTimetableId]) {
        result[targetTimetableId].push({
          place: transformedPlace,
          start: getTimeSlotIndex(
            timetables.find((t) => t.timetableId === targetTimetableId)
              .startTime,
            place.startTime,
          ),
          duration: duration,
          memo: place.memo,
        });
      }
    });
    return result;
  };

  const getTimeSlotIndex = (timeTableStartTime, time) => {
    const toMinutes = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const startMinutes = toMinutes(timeTableStartTime);
    const targetMinutes = toMinutes(time);
    return Math.floor((targetMinutes - startMinutes) / 15);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      let planData = null;
      if (id) {
        try {
          planData = await get(`${BASE_URL}/api/plan/${id}/complete`);
        } catch (err) {
          console.error("일정 정보를 가져오는데 실패했습니다:", err);
          alert("잘못된 접근입니다.");
          navigate("/");
          return;
        }
      } else {
        alert("잘못된 접근입니다.");
        navigate("/");
        return;
      }

      if (planData) {
        console.log("초기 데이터", planData);
        setData(planData);
        if (planData.timetables) {
          setTimetables(planData.timetables);
          if (planData.timetables.length > 0) {
            setSelectedDay(planData.timetables[0].timetableId);
          }
        }
        const result = transformApiResponse(planData);
        setTransformedData(result);
      }
    };

    fetchUserProfile();
  }, [id, get]);

  // --- [수정됨] 날씨 정보 호출 useEffect ---
  useEffect(() => {
    // 1. 데이터가 아직 로드되지 않았으면 중단
    if (!data?.planFrame || !timetables.length) {
      return;
    }

    const city = data.planFrame.travelCategoryName;
    const startDate = timetables[0].date;
    const endDate = timetables[timetables.length - 1].date;

    // 2. 요청 파라미터 식별자 생성
    const currentParams = JSON.stringify({ city, startDate, endDate });

    // 3. [핵심 수정] 이미 시도한 파라미터라면 중단 (성공/실패 여부 무관)
    if (lastWeatherFetchParams.current === currentParams) {
      return;
    }

    const fetchWeather = async () => {
      if (!city) {
        console.warn(
          "지역 정보(travelCategoryName)가 없어 날씨를 조회할 수 없습니다.",
        );
        lastWeatherFetchParams.current = currentParams; // 다시 시도하지 않도록 설정
        return;
      }

      setWeatherLoading(true);
      lastWeatherFetchParams.current = currentParams; // 요청 시작 시점에 기록

      try {
        const response = await axios.post(`${AI_API_URL}/recommendations`, {
          city: city,
          start_date: startDate,
          end_date: endDate,
        });
        setWeatherData(response.data);
      } catch (err) {
        console.error("날씨 정보 호출 실패 (Complete):", err);
        // 에러가 발생해도 lastWeatherFetchParams가 설정되어 있으므로 무한 재시도 안 함
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();

    // [수정] 의존성 배열에서 weatherData, weatherLoading 제거.
    // data와 timetables가 변경될 때만(즉, 페이지 로드 시) 실행됨.
  }, [data, timetables]);
  // --- 날씨 로직 끝 ---

  useEffect(() => {
    if (transformedData) {
      setSchedule(transformedData);
      cleanSchedule();
    } else if (timetables.length > 0) {
      const initialSchedule = {};
      timetables.forEach((timetable) => {
        initialSchedule[timetable.timetableId] = [];
      });
      setSchedule(initialSchedule);
      cleanSchedule();
    }
  }, [timetables, transformedData]);

  const cleanSchedule = () => {
    setSchedule((prevSchedule) => {
      const newSchedule = {};
      for (const key in prevSchedule) {
        const seen = new Set();
        newSchedule[key] = prevSchedule[key].filter((item) => {
          if (seen.has(item.placeId)) return false;
          seen.add(item.placeId);
          return true;
        });
      }
      return newSchedule;
    });
  };

  useEffect(() => {
    if (selectedDay && schedule[selectedDay]) {
      const sortedSchedule = [...(schedule[selectedDay] || [])].sort((a, b) =>
        a.timeSlot.localeCompare(b.timeSlot),
      );
      const newPositions =
        sortedSchedule.length > 0
          ? sortedSchedule.map((item) => ({
              lat: item.ylocation,
              lng: item.xlocation,
            }))
          : [{ lat: 37.5665, lng: 126.978 }];
      setPositions(newPositions);
    }
  }, [selectedDay, schedule]);

  useEffect(() => {
    const sade = Object.fromEntries(
      Object.entries(schedule).map(([key, places]) => [
        key,
        [...places].sort((a, b) => {
          const timeA = a.timeSlot.split(":").map(Number);
          const timeB = b.timeSlot.split(":").map(Number);
          return timeA[0] - timeB[0] || timeA[1] - timeB[1];
        }),
      ]),
    );
    setSortedState(sade);
  }, [schedule]);

  useEffect(() => {
    if (!map || !positions.length) return;
    const bounds = new window.kakao.maps.LatLngBounds();
    positions.forEach((pos) => {
      bounds.extend(new window.kakao.maps.LatLng(pos.lat, pos.lng));
    });
    map.setBounds(bounds);
  }, [map, positions]);

  const getCurrentTimeSlots = () => {
    if (!selectedDay || !timetables.length) return [];
    const currentTimetable = timetables.find(
      (t) => t.timetableId === selectedDay,
    );
    if (!currentTimetable) return [];
    const startHour = parseInt(currentTimetable.startTime.split(":")[0]);
    const endHour = parseInt(currentTimetable.endTime.split(":")[0]);
    const timeSlots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        timeSlots.push(
          `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        );
      }
    }
    return timeSlots;
  };

  const timeSlots = getCurrentTimeSlots();

  const getCurrentEndTime = () => {
    if (!selectedDay || !timetables.length) return "20:00";
    const currentTimetable = timetables.find(
      (t) => t.timetableId === selectedDay,
    );
    return currentTimetable
      ? currentTimetable.endTime.substring(0, 5)
      : "20:00";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${month}.${day}.`;
  };

  const getDayNumber = (timetableId) => {
    const index = timetables.findIndex((t) => t.timetableId === timetableId);
    return index + 1;
  };

  const getTimeSlotIndex = (timeSlot) => {
    return timeSlots.indexOf(timeSlot);
  };

  const renderScheduleItem = (item) => {
    const startIndex = getTimeSlotIndex(item.timeSlot);
    const height = item.duration * 30;
    const tripColor1 = {
      0: "bg-lime-50",
      1: "bg-orange-50",
      2: "bg-blue-50",
      4: "bg-gray-50",
    };
    const tripColor2 = {
      0: "border-lime-100",
      1: "border-orange-100",
      2: "border-blue-100",
      4: "border-gray-100",
    };

    return (
      <div
        key={item.placeId}
        className={`absolute left-16 p-2 text-sm shadow-xl border ${tripColor1[item.categoryId]} ${tripColor2[item.categoryId]} rounded-lg z-10 group cursor-move`}
        style={{
          top: `${startIndex * 30}px`,
          height: `${height}px`,
          width: "329px",
        }}
      >
        <div
          className="p-3 h-full flex items-center justify-between"
          style={{ paddingTop: "12px", paddingBottom: "12px" }}
        >
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg truncate">{item.name}</div>
            <div className="text-gray-500 truncate text-sm">
              {tripCategory[item.categoryId]}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!selectedDay || !timetables.length) {
    return (
      <div className="min-h-screen font-pretendard">
        <Navbar />
        <div className="w-[1400px] mx-auto py-6 flex items-center justify-center">
          <div>일정 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-pretendard">
      <Navbar />
      <div className="w-[1400px] mx-auto py-6">
        <div className={`flex items-center justify-between pb-6`}>
          <div className="font-bold text-2xl">
            {data?.planFrame?.planName || "여행 계획"}
          </div>
          <div className="space-x-3">
            <button
              onClick={() => navigate(`/create?id=${id}`)}
              className="px-3 py-1.5 rounded-lg bg-gray-300 hover:bg-gray-400"
            >
              수정
            </button>
            <button
              onClick={() => setIsShareOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-sub border border-main"
            >
              공유
            </button>
            <button
              onClick={() => navigate("/mypage")}
              className="px-3 py-1.5 rounded-lg text-white bg-main"
            >
              확인
            </button>
          </div>
        </div>
        <div className="flex space-x-6 flex-1">
          {/* 일차 선택 */}
          <div className="flex flex-col space-y-4">
            {timetables.map((timetable, index) => {
              // 해당 날짜의 날씨 정보 찾기
              const dayWeather = weatherData?.weather?.[index];

              return (
                <button
                  key={timetable.timetableId}
                  className={`px-4 py-4 rounded-lg flex items-center space-x-3 text-left ${
                    selectedDay === timetable.timetableId
                      ? "bg-main text-white"
                      : "bg-white text-gray-700 border border-gray-300"
                  }`}
                  onClick={() => setSelectedDay(timetable.timetableId)}
                >
                  {/* === 날씨 정보 표시 UI === */}
                  <div
                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg ${
                      selectedDay === timetable.timetableId
                        ? "bg-white bg-opacity-30"
                        : "bg-gray-100"
                    }`}
                  >
                    {weatherLoading ? (
                      <span className="text-xs">...</span>
                    ) : dayWeather ? (
                      <>
                        <span
                          className="text-3xl"
                          title={dayWeather.description}
                        >
                          {getWeatherIcon(dayWeather.description)}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            selectedDay === timetable.timetableId
                              ? "text-white"
                              : "text-gray-700"
                          }`}
                        >
                          {Math.round(dayWeather.temp_min)}°/
                          {Math.round(dayWeather.temp_max)}°
                        </span>
                      </>
                    ) : (
                      // 날씨 정보가 없거나 로드 실패 시
                      <span
                        className={`text-2xl ${
                          selectedDay === timetable.timetableId
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {getWeatherIcon(null)}
                      </span>
                    )}
                  </div>
                  {/* === 날씨 UI 끝 === */}

                  <div className="flex-1">
                    <div className="text-xl font-semibold">
                      {getDayNumber(timetable.timetableId)}일차
                    </div>
                    <div
                      className={`text-sm ${
                        selectedDay === timetable.timetableId
                          ? "text-gray-200"
                          : "text-gray-500"
                      }`}
                    >
                      {formatDate(timetable.date)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 시간표 */}
          <div className="w-[450px] h-full">
            <div className="border border-gray-300 bg-white rounded-lg px-5 py-7 relative h-[calc(100vh-189px)] overflow-y-auto">
              <div className="relative border-t border-gray-200">
                {timeSlots.map((time, index) => (
                  <div
                    key={time}
                    className="flex items-center relative border-b border-gray-200"
                    style={{ height: "30px" }}
                  >
                    <div className="w-10 text-xs text-gray-500 absolute top-[-25%] bg-white">
                      {time}
                    </div>
                    {index + 1 === timeSlots.length ? (
                      <div className="w-10 text-xs text-gray-500 absolute bottom-[-30%] bg-white">
                        {getCurrentEndTime()}
                      </div>
                    ) : (
                      <></>
                    )}
                    <div className="flex-1 h-full"></div>
                  </div>
                ))}

                {/* 스케줄 아이템들 */}
                {(schedule[selectedDay] || []).map((item) =>
                  renderScheduleItem(item),
                )}
              </div>
            </div>
          </div>

          {/* 지도 */}
          <div className="flex-1 border border-gray-300 rounded-lg h-[calc(100vh-189px)] overflow-y-auto">
            <Map
              id="map"
              center={{
                lat: 33.452278,
                lng: 126.567803,
              }}
              style={{
                width: "100%",
                height: "100%",
              }}
              level={3}
              onCreate={setMap}
            >
              {(sortedState[selectedDay] || []).map((item, index) => {
                return (
                  <MapMarker
                    key={item.placeId}
                    position={{
                      lat: item.ylocation,
                      lng: item.xlocation,
                    }}
                  >
                    <div
                      className="p-2 w-[159px]"
                      style={{ borderRadius: "4rem" }}
                    >
                      <p className="text-lg font-semibold truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center space-x-1">
                        <div className="text-sm w-[22px] h-[22px] border border-main text-main font-semibold rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                        <a
                          href={item.url}
                          style={{ color: "blue" }}
                          className="text-sm hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          장소 정보 보기
                        </a>
                      </div>
                    </div>
                  </MapMarker>
                );
              })}
              {positions.length > 1 &&
                positions.slice(0, -1).map((pos, idx) => {
                  return (
                    <Polyline
                      key={`polyline-${idx}`}
                      path={[pos, positions[idx + 1]]}
                      strokeWeight={4}
                      strokeColor={"#1344FF"}
                      strokeOpacity={0.5}
                      strokeStyle={"arrow"}
                      endArrow={true}
                    />
                  );
                })}
            </Map>
          </div>
        </div>
      </div>
      {isShareOpen && (
        <ShareModal isOwner={true} setIsShareOpen={setIsShareOpen} id={id} />
      )}
    </div>
  );
};

export default TravelPlannerApp;
