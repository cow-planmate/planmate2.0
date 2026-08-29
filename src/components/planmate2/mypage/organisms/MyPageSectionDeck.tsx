import { CalendarRange, Compass, MapPinned, type LucideIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export type MyPageSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  content: React.ReactNode;
};

interface MyPageSectionDeckProps {
  sections: MyPageSection[];
}

const STEP_ICONS = [CalendarRange, MapPinned, Compass];

export const MyPageSectionDeck: React.FC<MyPageSectionDeckProps> = ({ sections }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewportHeight, setViewportHeight] = useState<number>();
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (activeIndex >= sections.length) setActiveIndex(0);
  }, [activeIndex, sections.length]);

  useEffect(() => {
    const panel = panelRefs.current[activeIndex];
    if (!panel) return;

    const updateHeight = () => setViewportHeight(panel.getBoundingClientRect().height);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [activeIndex, sections.length]);

  return (
    <section aria-label="마이페이지 콘텐츠" className="border-t border-slate-200/80">
      <div className="relative bg-white px-3 sm:px-7 lg:px-10">
        <div className="relative grid grid-cols-3" role="tablist" aria-label="마이페이지 섹션">
          {sections.map((section, index) => {
            const isActive = activeIndex === index;
            const StepIcon = STEP_ICONS[index] ?? section.icon;
            return (
              <button
                key={section.id}
                id={`mypage-tab-${section.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`mypage-panel-${section.id}`}
                onClick={() => setActiveIndex(index)}
                className={`group relative flex min-h-[78px] items-center justify-center gap-3 border-b-2 px-2 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1344FF] sm:min-h-[92px] sm:px-5 ${
                  isActive
                    ? "border-[#1344FF] bg-[#1344FF]/[0.035] text-[#1344FF]"
                    : "border-transparent bg-white text-slate-500 hover:bg-slate-50/70 hover:text-slate-900"
                }`}
              >
                <span className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:flex ${isActive ? "bg-[#1344FF] text-white shadow-md shadow-blue-200" : "bg-slate-100"}`}>
                  <StepIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className={`block text-[10px] font-bold tracking-[0.14em] sm:text-xs ${isActive ? "text-[#1344FF]/60" : "text-slate-400"}`}>
                    {String(index + 1).padStart(2, "0")} · {section.eyebrow}
                  </span>
                  <span className="mt-1 block break-keep text-xs font-extrabold leading-snug sm:text-base">
                    {section.title}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[#f7f9fc] px-5 pb-5 pt-8 sm:px-9 sm:pb-7 sm:pt-10 lg:px-12">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#1344FF]">
            {sections[activeIndex]?.eyebrow}
          </p>
          <h2 className="text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
            {sections[activeIndex]?.title}
          </h2>
          <p className="mt-2 max-w-2xl break-keep text-sm leading-6 text-slate-500 sm:text-base">
            {sections[activeIndex]?.description}
          </p>
        </div>
        <span className="hidden shrink-0 text-sm font-bold tabular-nums text-slate-400 sm:block">
          {activeIndex + 1} <span className="mx-1 text-slate-200">/</span> {sections.length}
        </span>
      </div>

      <div
        className="overflow-hidden [&_.shadow-md]:border [&_.shadow-md]:border-slate-200/80 [&_.shadow-md]:shadow-none"
        style={viewportHeight ? { height: viewportHeight } : undefined}
      >
        <div
          className="flex items-start"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {sections.map((section, index) => (
            <div
              key={section.id}
              ref={(node) => { panelRefs.current[index] = node; }}
              id={`mypage-panel-${section.id}`}
              role="tabpanel"
              aria-labelledby={`mypage-tab-${section.id}`}
              aria-hidden={activeIndex !== index}
              {...(activeIndex !== index ? { inert: "" as any } : {})}
              className="w-full shrink-0"
            >
              {section.content}
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
};
