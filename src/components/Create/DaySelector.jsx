import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useRef } from "react"; // useRef 추가
import { createPortal } from "react-dom";
import TimeTable from "./TimeTable";

// 날씨 기능에 필요한 모듈 추가
import axios from "axios";
import usePlanStore from "../../store/Plan"; // Zustand 스토어 import (경로 수정)

// AI 서버 URL
const AI_API_URL = import.meta.env.VITE_AI_API_URL;

// 종료 날짜 계산
const getEndDate = (startDate, period) => {
  if (!startDate || !period) return "";
  try {
    const date = new Date(startDate);
    date.setDate(date.getDate() + period - 1);
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("날짜 계산 오류:", error);
    return "";
  }
};

// 날씨 설명(텍스트)을 기반으로 아이콘 반환
const getWeatherIcon = (description) => {
  if (!description) return "❓"; // 알 수 없음
  const desc = description.toLowerCase();

  if (desc.includes("맑음")) return "☀️";
  if (desc.includes("구름") || desc.includes("흐림")) {
    if (
      desc.includes("조금") ||
      desc.includes("약간") ||
      desc.includes("부분")
    ) {
      return "🌤️"; // 구름 조금
    }
    return "☁️"; // 흐림
  }
  if (desc.includes("비") || desc.includes("소나기")) {
    if (desc.includes("약한") || desc.includes("가벼운")) {
      return "🌦️"; // 가벼운 비
    }
    return "🌧️"; // 비
  }
  if (desc.includes("눈")) return "❄️";
  if (desc.includes("안개")) return "🌫️";
  if (desc.includes("뇌우")) return "⛈️";

  return "🌤️"; // 기타 (대체로 맑음 등)
};
// --- 날씨 헬퍼 함수 끝 ---

const DaySelector = ({
  timetables,
  timeDispatch,
  selectedDay,
  onDaySelect,
  stompClientRef,
  id,
  schedule,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${month}.${day}.`;
  };

  useEffect(() => {
    console.log(timetables);
  }, [timetables]);

  // --- 날씨 정보 로딩 로직 ---
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  // [수정] 무한 루프 방지를 위한 Ref 추가
  const lastFetchParams = useRef(null);

  // Zustand 스토어에서 날씨 API에 필요한 정보 가져오기
  const travelCategoryName = usePlanStore((state) => state.travelCategoryName);
  const startDate = usePlanStore((state) => state.startDate);
  const period = usePlanStore((state) => state.period);

  useEffect(() => {
    // 1. 현재 요청할 파라미터 생성
    const currentParams = JSON.stringify({
      travelCategoryName,
      startDate,
      period,
    });

    // 2. [핵심 수정] 이전에 시도한 파라미터와 같으면(성공/실패 무관) 중단
    if (lastFetchParams.current === currentParams) {
      return;
    }

    const fetchWeather = async () => {
      if (!travelCategoryName || !startDate || !period) {
        // 정보 부족 시에도 중복 경고 방지를 위해 파라미터 기록
        lastFetchParams.current = currentParams;
        console.warn(
          "DaySelector: 날씨 정보를 가져오기 위한 정보(여행지, 날짜, 기간)가 부족합니다."
        );
        return;
      }

      setWeatherLoading(true);
      setWeatherError(null);

      // 요청 시작 시점에 파라미터 기록 (중복 호출 차단)
      lastFetchParams.current = currentParams;

      try {
        const calculatedEndDate = getEndDate(startDate, period);
        if (!calculatedEndDate) {
          throw new Error("종료 날짜 계산에 실패했습니다.");
        }

        const response = await axios.post(`${AI_API_URL}/recommendations`, {
          city: travelCategoryName,
          start_date: startDate,
          end_date: calculatedEndDate,
        });
        setWeatherData(response.data);
      } catch (err) {
        console.error("날씨 정보 호출 실패 (DaySelector):", err);
        setWeatherError(`날씨 정보를 불러오는 데 실패했습니다.`);
        // 에러가 발생해도 lastFetchParams가 설정되어 있으므로 무한 재시도 안 함
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();

    // [수정] 의존성 배열에서 weatherData, weatherLoading 제거
  }, [travelCategoryName, startDate, period]);
  // --- 날씨 로직 끝 ---

  return (
    <>
      <div className="flex flex-col space-y-4">
        {timetables.map((timetable, index) => {
          // 해당 날짜의 날씨 정보 찾기
          const dayWeather = weatherData?.weather?.[index];

          return (
            <button
              key={timetable.timetableId}
              // flex-col 제거, flex, items-center, space-x-3 추가
              className={`px-4 py-4 rounded-lg flex items-center space-x-3 text-left ${
                selectedDay === timetable.timetableId
                  ? "bg-main text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
              onClick={() => onDaySelect(timetable.timetableId)}
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
                    <span className="text-3xl" title={dayWeather.description}>
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

              {/* 날짜/일차 정보를 div로 묶음 */}
              <div className="flex-1">
                <div className="text-xl font-semibold">{index + 1}일차</div>
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
        {/* 원본 모달 버튼 */}
        <button
          className="text-2xl text-gray-500 hover:text-gray-700"
          onClick={() => setIsModalOpen(true)}
        >
          <FontAwesomeIcon icon={faCalendarDays} />
        </button>
      </div>
      {/* 원본 모달 로직 */}
      {isModalOpen &&
        createPortal(
          <Modal
            setIsModalOpen={setIsModalOpen}
            timetables={timetables}
            timeDispatch={timeDispatch}
            stompClientRef={stompClientRef}
            id={id}
            onDaySelect={onDaySelect}
            selectedDay={selectedDay}
            schedule={schedule}
          />,
          document.body
        )}
    </>
  );
};

//
// --- 원본 Modal 컴포넌트 ---
//
const Modal = ({
  setIsModalOpen,
  timetables,
  timeDispatch,
  stompClientRef,
  id,
  selectedDay,
  onDaySelect,
  schedule,
}) => {
  const [newTime, setNewTime] = useState(timetables);
  console.log(schedule);

  const [create, setCreate] = useState({ timetableVOs: [] });
  const [update, setUpdate] = useState({ timetableVOs: [] });
  const [deleteTime, setDelete] = useState({ timetableVOs: [] });

  const times = [];
  for (let h = 0; h < 25; h++) {
    for (let m = 0; m < 60; m += 60) {
      const formatted = `${String(h).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )}:00`;
      times.push(formatted);
    }
  }

  const updateDate = (e) => {
    if (e.target.value) {
      const baseDate = new Date(e.target.value);

      const updatedTimes = newTime.map((item, index) => {
        const newDate = new Date(baseDate);
        newDate.setDate(baseDate.getDate() + index);
        return { ...item, date: newDate.toISOString().split("T")[0] };
      });

      setNewTime(updatedTimes);

      setUpdate((prev) => ({
        ...prev,
        timetableVOs: updatedTimes,
      }));
    }
  };

  const updateTime = (e, index, timetableId, se) => {
    const baseTime = e.target.value;
    let updatedTimes = null;

    if (se == "start") {
      updatedTimes = newTime.map((item, i) =>
        i === index ? { ...item, startTime: baseTime } : item
      );
    } else if (se == "end") {
      updatedTimes = newTime.map((item, i) =>
        i === index ? { ...item, endTime: baseTime } : item
      );
    }

    setNewTime(updatedTimes);

    if (timetableId < 1 && timetableId >= 0) {
      setCreate((prev) => ({
        ...prev, // 기존 객체 속성 유지
        timetableVOs: prev.timetableVOs.map((item) =>
          item.timetableId === timetableId ? updatedTimes[index] : item
        ),
      }));
    } else {
      setUpdate((prev) => ({
        ...prev,
        timetableVOs: updatedTimes,
      }));
    }
  };

  const addDay = () => {
    const lastDateStr = newTime[newTime.length - 1].date;
    const lastDate = new Date(lastDateStr);
    lastDate.setDate(lastDate.getDate() + 1);
    const newDate = lastDate.toISOString().split("T")[0];
    const newId = Math.random();

    const timetableVO = {
      timetableId: newId,
      date: newDate,
      startTime: "09:00:00",
      endTime: "20:00:00",
    };

    setNewTime((prev) => [...prev, timetableVO]);

    setCreate((prev) => ({
      ...prev,
      timetableVOs: [...prev.timetableVOs, timetableVO],
    }));

    setDelete((prev) => ({
      ...prev,
      timetableVOs: prev.timetableVOs.filter(
        (item) => item.timetableId !== newId
      ),
    }));
  };

  useEffect(() => {
    console.log(create);
    console.log(deleteTime);
  }, [create, deleteTime]);

  useEffect(() => {
    console.log(newTime);
  }, [newTime]);

  const deleteDay = () => {
    setNewTime((prev) => {
      if (prev.length <= 1) return prev;

      const newArr = [...prev];
      const lastElement = newArr.pop(); // 마지막 요소 제거 및 저장

      setCreate((prev) => ({
        ...prev,
        timetableVOs: prev.timetableVOs.filter(
          (item) => item.timetableId !== lastElement.timetableId
        ),
      }));

      setDelete((prev2) => ({
        ...prev2,
        timetableVOs: [
          ...prev2.timetableVOs,
          { timetableId: lastElement.timetableId },
        ],
      }));

      return newArr;
    });
  };

  const hasOutOfRange = (schedule, newTime) => {
    const toMinutes = (timeStr) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    return newTime.some(({ timetableId, startTime, endTime }) => {
      const places = schedule[timetableId];
      if (!places || places.length === 0) return false;

      const startMin = toMinutes(startTime);
      const endMin = toMinutes(endTime);

      return places.some((place) => {
        const placeStartMin = toMinutes(place.timeSlot);
        const placeEndMin = placeStartMin + place.duration * 15;
        return placeStartMin < startMin || placeEndMin > endMin;
      });
    });
  };

  const handleComfirm = () => {
    const isInvalid = newTime.some((item) => item.startTime >= item.endTime);

    if (isInvalid) {
      alert("시작 시간이 종료 시간과 같거나 큰 항목이 있습니다.");
      return;
    }

    if (hasOutOfRange(schedule, newTime)) {
      alert("변경하려는 시간이 블록과 충돌합니다.");
      return;
    }

    const client = stompClientRef.current;

    if (client && client.connected) {
      if (create.timetableVOs && create.timetableVOs.length > 0) {
        client.publish({
          destination: `/app/plan/${id}/create/timetable`,
          body: JSON.stringify(create),
        });
        console.log("🚀 메시지 전송:", create);
      }

      if (update.timetableVOs && update.timetableVOs.length > 0) {
        client.publish({
          destination: `/app/plan/${id}/update/timetable`,
          body: JSON.stringify(update),
        });
        console.log("🚀 메시지 전송:", update);
      }

      if (deleteTime.timetableVOs && deleteTime.timetableVOs.length > 0) {
        client.publish({
          destination: `/app/plan/${id}/delete/timetable`,
          body: JSON.stringify(deleteTime),
        });
        console.log("🚀 메시지 전송:", deleteTime);
      }

      timeDispatch({ type: "update", payload: newTime });

      const dateId = newTime.map((t) => t.timetableId);
      if (!dateId.includes(selectedDay)) {
        onDaySelect(dateId[dateId.length - 1]);
      }

      setIsModalOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm font-pretendard"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-2">일정 변경</h2>
        <div className="my-5 max-h-[calc(100vh-300px)] overflow-auto">
          <div className="divide-y">
            <div className="space-x-3 py-2 grid grid-cols-[1fr_3fr_3fr_3fr] gap-4 items-center text-sm text-gray-500">
              <div>일차</div>
              <div>날짜</div>
              <div>시작 시간</div>
              <div>종료 시간</div>
            </div>
            {newTime.map((timetable, index) => {
              if (index == 0) {
                return (
                  <div
                    key={timetable.timetableId}
                    className="space-x-3 py-2 grid grid-cols-[1fr_3fr_3fr_3fr] gap-4 items-center"
                  >
                    <div>{index + 1}일차</div>
                    <input
                      type="date"
                      value={timetable.date}
                      className="border rounded-lg px-2 h-11"
                      onChange={updateDate}
                    />
                    <select
                      value={timetable.startTime}
                      onChange={(e) =>
                        updateTime(e, index, timetable.timetableId, "start")
                      }
                      className="border rounded-lg px-2 h-11"
                    >
                      {times.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <select
                      value={timetable.endTime}
                      onChange={(e) =>
                        updateTime(e, index, timetable.timetableId, "end")
                      }
                      className="border rounded-lg px-2 h-11"
                    >
                      {times.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              } else {
                return (
                  <div
                    key={timetable.timetableId}
                    className="space-x-3 py-2 grid grid-cols-[1fr_3fr_3fr_3fr] gap-4 items-center"
                  >
                    <div>{index + 1}일차</div>
                    <div>{timetable.date}</div>
                    <select
                      value={timetable.startTime}
                      onChange={(e) =>
                        updateTime(e, index, timetable.timetableId, "start")
                      }
                      className="border rounded-lg px-2 h-11"
                    >
                      {times.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <select
                      value={timetable.endTime}
                      onChange={(e) =>
                        updateTime(e, index, timetable.timetableId, "end")
                      }
                      className="border rounded-lg px-2 h-11"
                    >
                      {times.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
            })}
            <div className="py-3 space-x-2 text-end">
              <button
                onClick={() => deleteDay()}
                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 text-xl"
              >
                -
              </button>
              <button
                onClick={() => addDay()}
                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 text-xl"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
          >
            취소
          </button>
          <button
            className="px-4 py-2.5 bg-main text-white rounded-xl font-medium transition-all duration-200 shadow-sm"
            onClick={() => handleComfirm()}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default DaySelector;
