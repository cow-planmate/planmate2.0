import { useEffect } from "react";
import { X } from "lucide-react";
import MapComponent from "../../common/MapComponent";
import { getTimeTableId } from "../../../utils/createUtils";
import useTimetableStore from "../../../store/Timetables";
import useItemsStore from "../../../store/Schedules";

export default function MapModal({ setIsMapOpen }) {
  const { timetables, selectedDay } = useTimetableStore();
  const { items } = useItemsStore();
  const schedule = items[getTimeTableId(timetables, selectedDay)] || [];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsMapOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsMapOpen]);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-3 font-pretendard backdrop-blur-[2px] sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setIsMapOpen(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-map-title"
        className="flex w-full max-w-[1400px] flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl"
        style={{ height: "min(900px, calc(100vh - 48px))" }}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#ececf0] px-5 sm:px-6">
          <div>
            <h2 id="create-map-title" className="text-lg font-black text-[#111318]">여행 동선</h2>
            <p className="mt-0.5 text-xs text-[#8b909a]">장소와 이동 경로를 확인해 보세요</p>
          </div>
          <button
            type="button"
            onClick={() => setIsMapOpen(false)}
            aria-label="여행 동선 지도 닫기"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="relative min-h-0 w-full bg-gray-100" style={{ flex: "1 1 0%", height: "calc(100% - 64px)" }}>
          <MapComponent
            schedule={schedule}
            defaultSegmentInfoOpen={false}
            segmentPanelVariant="edge"
          />
        </div>
      </section>
    </div>
  );
}
