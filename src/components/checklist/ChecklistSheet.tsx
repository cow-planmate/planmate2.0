import { CheckSquare2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChecklistPanel } from "./ChecklistPanel";
import { usePlanChecklists } from "./usePlanChecklists";

interface ChecklistSheetProps {
  planId?: string | null;
  enabled?: boolean;
  variant?: "floating" | "summary";
  className?: string;
}

export const ChecklistSheet = ({
  planId,
  enabled = true,
  variant = "floating",
  className = "",
}: ChecklistSheetProps) => {
  const [open, setOpen] = useState(false);
  const checklist = usePlanChecklists(planId, Boolean(planId && enabled));
  const totalDone = checklist.counts.shared.done + checklist.counts.personal.done;
  const totalItems = checklist.counts.shared.total + checklist.counts.personal.total;

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      {variant === "floating" ? (
        <div
          className={`group fixed bottom-20 right-4 z-30 md:bottom-6 md:right-6 ${className}`}
        >
          <div className="pointer-events-none absolute bottom-full right-0 mb-3 hidden w-64 translate-y-2 rounded-2xl border border-gray-100 bg-white p-4 opacity-0 shadow-[0_14px_35px_rgba(15,23,42,0.16)] transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 md:block">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-black text-gray-800">준비 현황</span>
              <span className="text-[11px] font-bold text-gray-400">
                {totalDone}/{totalItems}
              </span>
            </div>
            <div className="space-y-3">
              {(["shared", "personal"] as const).map((scope) => {
                const label = scope === "shared" ? "공동 준비" : "개인 준비";
                const count = checklist.counts[scope];
                const successRate = count.total
                  ? Math.round((count.done / count.total) * 100)
                  : 0;

                return (
                  <div key={scope}>
                    <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-600">{label}</span>
                      <span className="text-[#1344FF]">
                        {successRate}%
                        <span className="ml-1 font-medium text-gray-400">
                          ({count.done}/{count.total})
                        </span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-[#1344FF] transition-[width] duration-300"
                        style={{ width: `${successRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[#1344FF] px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(19,68,255,0.28)] transition hover:-translate-y-0.5 hover:bg-[#0e35cc]"
          >
            <CheckSquare2 className="h-5 w-5" />
            체크리스트
            {totalItems > 0 && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px]">
                {totalDone}/{totalItems}
              </span>
            )}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setOpen(true);
          }}
          className={`group w-full rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-left transition-colors hover:border-gray-200 hover:bg-gray-100 active:bg-gray-200 ${className}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-black text-gray-600">
              <CheckSquare2 className="h-4 w-4 text-[#1344FF]" /> 체크리스트
            </span>
            <span className="rounded-lg px-2 py-1 text-[11px] font-bold text-[#1344FF] transition-colors group-hover:bg-gray-200 group-active:bg-gray-300">
              전체 보기
            </span>
          </div>
          <div className="space-y-2.5">
            {(["shared", "personal"] as const).map((scope) => {
              const label = scope === "shared" ? "공동 준비" : "개인 준비";
              const count = checklist.counts[scope];
              const percent = count.total ? (count.done / count.total) * 100 : 0;
              return (
                <div key={scope}>
                  <div className="mb-1 flex justify-between text-[11px] font-bold text-gray-500">
                    <span>{label}</span>
                    <span>{count.done}/{count.total}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-[#1344FF] transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </button>
      )}

      {open && createPortal(
        <div
          className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-[1px] ${
            variant === "summary" ? "flex items-center justify-center p-4" : ""
          }`}
          role="presentation"
          onMouseDown={(event) => {
            event.stopPropagation();
            if (event.target === event.currentTarget) setOpen(false);
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="travel-checklist-title"
            className={
              variant === "summary"
                ? "relative flex h-[min(720px,calc(100vh-2rem))] w-full max-w-[560px] flex-col rounded-[24px] bg-white p-5 shadow-2xl sm:p-6"
                : "absolute inset-x-0 bottom-0 flex max-h-[88vh] min-h-[65vh] flex-col rounded-t-[28px] bg-white p-5 shadow-2xl md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:min-h-0 md:w-[430px] md:rounded-none md:p-6"
            }
          >
            <header className="mb-5 flex items-start justify-between border-b pb-4">
              <div>
                <p className="mb-1 text-xs font-bold text-[#1344FF]">TRAVEL CHECKLIST</p>
                <h2 id="travel-checklist-title" className="text-xl font-black text-gray-900">
                  여행 준비
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="여행 준비 닫기"
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {planId ? (
              <ChecklistPanel checklist={checklist} enabled={enabled} />
            ) : (
              <div className="flex flex-1 items-center justify-center px-8 text-center text-sm text-gray-500">
                체크리스트를 사용하려면 일정을 먼저 저장해 주세요.
              </div>
            )}
          </section>
        </div>,
        document.body,
      )}
    </>
  );
};
