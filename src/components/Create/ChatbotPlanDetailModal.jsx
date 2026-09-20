import { CalendarDays, Clock3, MapPin, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import MapComponent from "../common/MapComponent";
import { PlaceActionButtons } from "../common/PlaceActionButtons";

const CATEGORY_ID = {
  ATTRACTION: 0,
  ACCOMMODATION: 1,
  RESTAURANT: 2,
  FREE: 3,
  SEARCH: 4,
};

const CATEGORY_LABEL = {
  ATTRACTION: "관광지",
  ACCOMMODATION: "숙소",
  RESTAURANT: "식당",
  FREE: "직접 추가",
  SEARCH: "검색 장소",
};

const minutesOf = (value) => {
  if (!value) return 0;
  const [hour = 0, minute = 0] = String(value).split(":").map(Number);
  return hour * 60 + minute;
};

const formatDate = (date) => {
  if (!date) return "날짜 미정";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));
};

export default function ChatbotPlanDetailModal({ plan, status = "pending", onClose }) {
  const timetables = useMemo(() => {
    const source = Array.isArray(plan?.timetables) ? plan.timetables : [];
    if (source.length) {
      return source.slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
    }

    const dates = [...new Set((plan?.placeBlocks ?? []).map((block) => block.date).filter(Boolean))];
    return dates.sort().map((date) => ({ date, timeTableStartTime: "00:00:00" }));
  }, [plan]);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    setSelectedDay(0);
  }, [plan]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const timetable = timetables[selectedDay] ?? timetables[0];
  const blocks = useMemo(() => {
    if (!timetable) return [];
    const timetableId = timetable.timeTableId ?? timetable.timetableId;
    return (plan?.placeBlocks ?? [])
      .filter((block) => {
        const blockTimetableId = block.timeTableId ?? block.timetableId;
        return timetableId != null && blockTimetableId != null
          ? String(blockTimetableId) === String(timetableId)
          : block.date === timetable.date;
      })
      .slice()
      .sort((a, b) => String(a.blockStartTime).localeCompare(String(b.blockStartTime)));
  }, [plan, timetable]);

  const mapSchedule = useMemo(() => {
    const dayStart = minutesOf(timetable?.timeTableStartTime);
    return blocks.map((block, index) => {
      const startMinutes = minutesOf(block.blockStartTime);
      const endMinutes = minutesOf(block.blockEndTime);
      return {
        id: block.blockId ?? `${block.date}-${block.blockStartTime}-${index}`,
        start: Math.max(0, Math.floor((startMinutes - dayStart) / 15)),
        duration: Math.max(1, Math.ceil((endMinutes - startMinutes) / 15)),
        memo: block.memo,
        place: {
          placeId: block.placeId,
          contentId: block.placeId,
          name: block.placeName,
          formatted_address: block.placeAddress,
          photoUrl: block.placeThumbnailUrl,
          copyrightDivCd: block.placeCopyrightDivCd,
          contentTypeId: block.placeContentTypeId,
          categoryId: CATEGORY_ID[block.blockCategory] ?? 4,
          yLocation: block.latitude,
          xLocation: block.longitude,
        },
      };
    });
  }, [blocks, timetable]);

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-[2px] sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="chatbot-plan-detail-title" className="flex h-[min(900px,calc(100dvh-48px))] w-full max-w-[1400px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 id="chatbot-plan-detail-title" className="truncate text-lg font-black text-slate-950">{plan?.planFrame?.planName || "AI 추천 일정"}</h2>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${status === "applied" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-[#1344FF]"}`}>{status === "applied" ? "반영 완료" : "미리보기"}</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">AI가 구성한 날짜별 장소와 동선을 확인해 보세요.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="AI 추천 일정 상세 닫기" className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="flex max-h-[48%] min-h-0 flex-col border-b border-slate-200 bg-white lg:max-h-none lg:border-b-0 lg:border-r">
            <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-slate-100 p-3">
              {timetables.map((day, index) => (
                <button key={day.timeTableId ?? day.date ?? index} type="button" onClick={() => setSelectedDay(index)} className={`flex-none rounded-xl px-3 py-2 text-left transition ${selectedDay === index ? "bg-[#1344FF] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  <span className="block text-xs font-black">Day {index + 1}</span>
                  <span className={`mt-0.5 block text-[10px] font-semibold ${selectedDay === index ? "text-blue-100" : "text-slate-400"}`}>{formatDate(day.date)}</span>
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="mb-4 flex items-center justify-between">
                <div><p className="flex items-center gap-1.5 text-sm font-black text-slate-900"><CalendarDays className="h-4 w-4 text-[#1344FF]" />{formatDate(timetable?.date)}</p><p className="mt-1 text-xs text-slate-400">{blocks.length}개 장소</p></div>
                <Sparkles className="h-5 w-5 text-[#1344FF]" />
              </div>

              <ol className="space-y-3">
                {blocks.map((block, index) => (
                  <li key={block.blockId ?? `${block.date}-${block.blockStartTime}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-[#1344FF]">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-black text-slate-900">{block.placeName}</p><p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-400"><Clock3 className="h-3 w-3" />{String(block.blockStartTime ?? "").slice(0, 5)}–{String(block.blockEndTime ?? "").slice(0, 5)}</p></div><PlaceActionButtons place={block} /></div>
                        {block.placeAddress ? <p className="mt-2 flex items-start gap-1 text-[11px] leading-4 text-slate-500"><MapPin className="mt-0.5 h-3 w-3 shrink-0" />{block.placeAddress}</p> : null}
                        {block.memo ? <p className="mt-2 rounded-lg bg-slate-50 px-2.5 py-2 text-[11px] leading-4 text-slate-600">{block.memo}</p> : null}
                        <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{CATEGORY_LABEL[block.blockCategory] ?? "장소"}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              {!blocks.length ? <div className="flex min-h-40 flex-col items-center justify-center text-center text-sm text-slate-400"><MapPin className="mb-2 h-7 w-7" />이 날짜에는 추천 장소가 없어요.</div> : null}
            </div>
          </aside>

          <div className="relative min-h-[320px] bg-slate-100">
            <MapComponent schedule={mapSchedule} segmentPanelVariant="edge" />
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
