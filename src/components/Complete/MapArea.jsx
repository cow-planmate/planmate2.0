import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";
import { getTimeTableId } from "../../utils/createUtils";
import MapComponent from "../common/MapComponent";

export default function MapArea({ placeBlocks, timetables, selectedDay, showSidebar }) {
  const schedule = placeBlocks[getTimeTableId(timetables, selectedDay)] || [];
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [openSegmentsOnModal, setOpenSegmentsOnModal] = useState(false);

  const openMapModal = (withSegments = false) => {
    setOpenSegmentsOnModal(withSegments);
    setIsMapModalOpen(true);
  };

  useEffect(() => {
    if (!isMapModalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsMapModalOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMapModalOpen]);

  return (
    <>
      <section className={`${showSidebar ? "block" : "hidden lg:block"} overflow-hidden rounded-2xl border border-[#ececf0] bg-white shadow-sm`}>
        <header className="flex items-center justify-between border-b border-[#ececf0] px-5 py-4">
          <div>
            <h2 className="text-base font-black text-[#111318]">여행 동선</h2>
            <p className="mt-0.5 text-xs text-[#8b909a]">장소와 이동 경로를 확인해 보세요</p>
          </div>
          <button
            type="button"
            onClick={() => openMapModal(false)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 text-xs font-bold text-[#4b5563] transition hover:border-[#1344FF]/30 hover:bg-[#f4f6ff] hover:text-[#1344FF]"
          >
            <Maximize2 className="h-3.5 w-3.5" /> 크게 보기
          </button>
        </header>
        <div className="h-[340px] w-full bg-gray-100 lg:h-[390px]">
          <MapComponent
            schedule={schedule}
            defaultSegmentInfoOpen={false}
            onSegmentInfoRequest={() => openMapModal(true)}
          />
        </div>
      </section>

      {isMapModalOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-3 backdrop-blur-[2px] sm:p-6"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setIsMapModalOpen(false);
              }}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="expanded-map-title"
                className="flex w-full max-w-[1400px] flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl"
                style={{ height: "min(900px, calc(100vh - 48px))" }}
              >
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#ececf0] px-5 sm:px-6">
                  <div>
                    <h2 id="expanded-map-title" className="text-lg font-black text-[#111318]">여행 동선</h2>
                    <p className="mt-0.5 text-xs text-[#8b909a]">장소와 이동 경로를 확인해 보세요</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(false)}
                    aria-label="지도 크게 보기 닫기"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </header>
                <div className="relative min-h-0 w-full bg-gray-100" style={{ flex: "1 1 0%", height: "calc(100% - 64px)" }}>
                  <MapComponent
                    schedule={schedule}
                    defaultSegmentInfoOpen={openSegmentsOnModal}
                    segmentPanelVariant="edge"
                  />
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
