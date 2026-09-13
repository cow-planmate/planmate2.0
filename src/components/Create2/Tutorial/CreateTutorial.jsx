import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  GripHorizontal,
  Hand,
  MapPin,
  MousePointerClick,
  Sparkles,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const NUDGE_STORAGE_KEY = "planmate-create-tutorial-nudge-dismissed-v1";
const SPOTLIGHT_GAP = 7;

const STEPS = [
  {
    key: "plan-info",
    target: '[data-tutorial="plan-info-button"]',
    title: "여행 정보",
    description: "여행지와 인원을 확인하고 바꿀 수 있어요.",
    action: "modal",
    modal: "plan-info",
  },
  {
    key: "day-selector",
    target: '[data-tutorial="day-button"]',
    targetIndex: 1,
    title: "날짜 선택",
    description: "편집할 일차를 바로 골라요.",
    action: "click",
  },
  {
    key: "day-settings",
    target: '[data-tutorial="day-settings-button"]',
    title: "일정 날짜와 시간 설정",
    description: "톱니바퀴에서 여행 일수와 날짜별 시작·종료 시간을 바꿀 수 있어요.",
    action: "modal",
    modal: "day-settings",
  },
  {
    key: "mobile-navigation",
    target: '[data-tutorial="mobile-navigation"]',
    title: "화면 전환",
    description: "시간표와 추천 장소를 탭으로 오가요.",
    action: "click",
    mobileOnly: true,
  },
  {
    key: "place-tabs",
    target: '[data-tutorial="place-tabs"]',
    title: "장소 찾기",
    description: "관광지·숙소·식당 중 원하는 탭을 눌러보세요.",
    action: "click",
    mobileView: "recommend",
  },
  {
    key: "drag-demo",
    target: '[data-tutorial="schedule-workspace"]',
    title: "끌어서 일정에 추가",
    description: "장소 카드를 원하는 시간으로 옮겨 놓아요.",
    kind: "drag",
    desktopOnly: true,
    mobileView: "recommend",
  },
  {
    key: "mobile-add",
    target: '[data-tutorial="mobile-add-button"]',
    title: "시간표에 바로 추가",
    description: "장소 카드의 추가 버튼을 눌러 시간표에 담아보세요.",
    action: "click",
    mobileOnly: true,
    mobileView: "recommend",
  },
  {
    key: "resize-demo",
    target: '[data-tutorial="timetable"]',
    title: "체류시간 조절",
    description: "블록의 위아래 손잡이를 당겨 시간을 바꿔요.",
    kind: "resize",
    mobileView: "timetable",
  },
  {
    key: "map",
    target: '[data-tutorial="map-button"]',
    title: "동선 확인",
    description: "전체 이동 경로를 지도에서 확인해 보세요.",
    action: "modal",
    modal: "map",
  },
  {
    key: "checklist",
    target: '[data-tutorial="checklist"]',
    title: "여행 준비",
    description: "준비물을 공동·개인 목록으로 나눠 챙겨요.",
    action: "modal",
    modal: "checklist",
  },
  {
    key: "complete",
    kind: "complete",
    title: "이제 직접 만들어보세요",
    description: "오른쪽 아래 사용법 버튼에서 언제든 다시 볼 수 있어요.",
  },
];

const readNudgePreference = () => {
  try {
    return window.localStorage.getItem(NUDGE_STORAGE_KEY) !== "true";
  } catch {
    return true;
  }
};

const rememberNudgeDismissal = () => {
  try {
    window.localStorage.setItem(NUDGE_STORAGE_KEY, "true");
  } catch {
    // 저장소를 사용할 수 없는 환경에서도 튜토리얼은 계속 동작한다.
  }
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getPaddedRect = (element, gap = SPOTLIGHT_GAP) => {
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  const left = clamp(rect.left - gap, 8, window.innerWidth - 8);
  const top = clamp(rect.top - gap, 8, window.innerHeight - 8);
  const right = clamp(rect.right + gap, 8, window.innerWidth - 8);
  const bottom = clamp(rect.bottom + gap, 8, window.innerHeight - 8);

  return {
    left,
    top,
    right,
    bottom,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
};

export default function CreateTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(readNudgePreference);
  const [stepIndex, setStepIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [targetRect, setTargetRect] = useState(null);
  const [isStepPositionPending, setIsStepPositionPending] = useState(false);
  const [calloutSize, setCalloutSize] = useState({ width: 304, height: 112 });
  const [demoLayout, setDemoLayout] = useState(null);
  const [isModalActive, setIsModalActive] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const calloutRef = useRef(null);
  const targetElementRef = useRef(null);
  const modalWasSeenRef = useRef(false);

  const steps = useMemo(
    () => STEPS.filter(
      (candidate) =>
        (!candidate.mobileOnly || isMobile) &&
        (!candidate.desktopOnly || !isMobile),
    ),
    [isMobile],
  );
  const step = steps[stepIndex] ?? steps[0];
  const isLastStep = stepIndex === steps.length - 1;
  const isIntroStep = step.kind === "complete";
  const tutorialStepCount = steps.filter((candidate) => candidate.kind !== "complete").length;

  const dismissNudge = useCallback(() => {
    rememberNudgeDismissal();
    setShowNudge(false);
  }, []);

  const openTutorial = useCallback(() => {
    dismissNudge();
    setStepIndex(0);
    setIsStepPositionPending(true);
    setIsModalActive(false);
    setIsOpen(true);
  }, [dismissNudge]);

  const closeTutorial = useCallback(() => {
    setIsOpen(false);
    setTargetRect(null);
    setIsStepPositionPending(false);
    setDemoLayout(null);
    setIsModalActive(false);
    setIsUserInteracting(false);
    modalWasSeenRef.current = false;
  }, []);

  const nextStep = useCallback(() => {
    if (isLastStep) {
      closeTutorial();
      return;
    }

    setIsStepPositionPending(true);
    setTargetRect(null);
    setDemoLayout(null);
    setIsModalActive(false);
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }, [closeTutorial, isLastStep, steps.length]);

  const previousStep = useCallback(() => {
    if (stepIndex === 0) return;

    setIsStepPositionPending(true);
    setTargetRect(null);
    setDemoLayout(null);
    setIsModalActive(false);
    setStepIndex((current) => Math.max(current - 1, 0));
  }, [stepIndex]);

  const measureTarget = useCallback(() => {
    setTargetRect(getPaddedRect(targetElementRef.current));
    setIsStepPositionPending(false);
  }, []);

  const measureDemo = useCallback(() => {
    if (!isOpen || !["drag-demo", "resize-demo"].includes(step.key)) {
      setDemoLayout(null);
      return;
    }

    const timetable = document.querySelector('[data-tutorial="timetable"]');
    const dropzone = document.querySelector('[data-tutorial="timetable-dropzone"]');
    const placeList = document.querySelector('[data-tutorial="place-results"]');
    const placeCard = document.querySelector("[data-tutorial-place-card]");
    const timetableRect = (dropzone || timetable)?.getBoundingClientRect();
    const sourceRect = (placeCard || placeList)?.getBoundingClientRect();

    if (!timetableRect) {
      setDemoLayout(null);
      return;
    }

    const width = clamp(timetableRect.width - 88, 150, 230);
    const endLeft = clamp(
      timetableRect.left + Math.min(64, timetableRect.width * 0.18),
      16,
      window.innerWidth - width - 16,
    );
    const endTop = clamp(
      timetableRect.top + Math.min(150, timetableRect.height * 0.28),
      90,
      window.innerHeight - 170,
    );

    if (step.key === "resize-demo") {
      setDemoLayout({ endLeft, endTop, width });
      return;
    }

    const fallbackLeft = isMobile ? 24 : Math.max(24, window.innerWidth - width - 40);
    const fallbackTop = clamp(window.innerHeight * 0.48, 120, window.innerHeight - 170);
    const startLeft = sourceRect
      ? clamp(sourceRect.left + 18, 16, window.innerWidth - width - 16)
      : fallbackLeft;
    const startTop = sourceRect
      ? clamp(sourceRect.top + Math.min(110, sourceRect.height * 0.22), 90, window.innerHeight - 170)
      : fallbackTop;

    setDemoLayout({
      startLeft,
      startTop,
      endLeft,
      endTop,
      width,
      deltaX: endLeft - startLeft,
      deltaY: endTop - startTop,
    });
  }, [isMobile, isOpen, step.key]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (isModalActive) return;
      if (event.key === "Escape") closeTutorial();
      if (
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName))
      ) {
        return;
      }
      if (event.key === "ArrowRight") nextStep();
      if (event.key === "ArrowLeft") previousStep();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeTutorial, isModalActive, isOpen, nextStep, previousStep]);

  useEffect(() => {
    setIsUserInteracting(false);

    if (!isOpen || !["drag", "resize"].includes(step.kind)) {
      return undefined;
    }

    const handleTutorialInteraction = (event) => {
      if (event.detail?.type !== step.kind) return;
      setIsUserInteracting(Boolean(event.detail.active));
    };

    window.addEventListener(
      "planmate:tutorial-interaction",
      handleTutorialInteraction,
    );
    return () => {
      window.removeEventListener(
        "planmate:tutorial-interaction",
        handleTutorialInteraction,
      );
    };
  }, [isOpen, step.key, step.kind]);

  useEffect(() => {
    if (!isOpen) return undefined;

    if (isMobile && step.mobileView) {
      window.dispatchEvent(
        new CustomEvent("planmate:tutorial-view", { detail: step.mobileView }),
      );
    }

    if (step.target) {
      const candidates = document.querySelectorAll(step.target);
      const targetIndex = Math.min(step.targetIndex ?? 0, candidates.length - 1);
      targetElementRef.current = candidates[targetIndex] ?? null;
    } else {
      targetElementRef.current = null;
    }

    const element = targetElementRef.current;
    if (!element) {
      setTargetRect(null);
      setIsStepPositionPending(false);
      return undefined;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    const firstMeasure = window.setTimeout(measureTarget, 70);
    const settledMeasure = window.setTimeout(measureTarget, 380);
    const resizeObserver = new ResizeObserver(measureTarget);
    resizeObserver.observe(element);
    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, { capture: true, passive: true });

    return () => {
      window.clearTimeout(firstMeasure);
      window.clearTimeout(settledMeasure);
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [isMobile, isOpen, measureTarget, step]);

  useEffect(() => {
    if (!isOpen || !targetElementRef.current || step.action !== "click") {
      return undefined;
    }

    const element = targetElementRef.current;
    const handleTargetClick = () => window.setTimeout(nextStep, 180);
    element.addEventListener("click", handleTargetClick);
    return () => element.removeEventListener("click", handleTargetClick);
  }, [isOpen, nextStep, step.action, step.key]);

  useEffect(() => {
    if (!isOpen || !step.modal) {
      modalWasSeenRef.current = false;
      return undefined;
    }

    const selector = `[data-tutorial-modal="${step.modal}"]`;
    const inspectModal = () => {
      const modal = document.querySelector(selector);

      if (modal) {
        modalWasSeenRef.current = true;
        setIsModalActive(true);
        return;
      }

      if (modalWasSeenRef.current) {
        modalWasSeenRef.current = false;
        setIsModalActive(false);
        window.setTimeout(nextStep, 180);
      }
    };

    inspectModal();
    const observer = new MutationObserver(inspectModal);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [isOpen, nextStep, step.key, step.modal]);

  useEffect(() => {
    if (!isOpen || !["drag-demo", "resize-demo"].includes(step.key)) {
      setDemoLayout(null);
      return undefined;
    }

    const firstMeasure = window.setTimeout(measureDemo, 100);
    const settledMeasure = window.setTimeout(measureDemo, 430);
    window.addEventListener("resize", measureDemo);
    return () => {
      window.clearTimeout(firstMeasure);
      window.clearTimeout(settledMeasure);
      window.removeEventListener("resize", measureDemo);
    };
  }, [isOpen, measureDemo, step.key]);

  useLayoutEffect(() => {
    if (!isOpen || !calloutRef.current) return;
    const rect = calloutRef.current.getBoundingClientRect();
    setCalloutSize({ width: rect.width, height: rect.height });
  }, [isOpen, isStepPositionPending, stepIndex, targetRect]);

  useEffect(() => {
    if (stepIndex >= steps.length) setStepIndex(steps.length - 1);
  }, [stepIndex, steps.length]);

  const calloutStyle = useMemo(() => {
    if (!targetRect) {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const edge = 14;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxLeft = Math.max(edge, viewportWidth - calloutSize.width - edge);
    const centeredLeft = clamp(
      targetRect.left + targetRect.width / 2 - calloutSize.width / 2,
      edge,
      maxLeft,
    );
    const belowTop = targetRect.bottom + 14;
    const aboveTop = targetRect.top - calloutSize.height - 14;

    if (belowTop + calloutSize.height <= viewportHeight - edge - 64) {
      return { left: centeredLeft, top: belowTop };
    }
    if (aboveTop >= edge + 52) {
      return { left: centeredLeft, top: aboveTop };
    }

    return {
      left: clamp(targetRect.right - calloutSize.width - 20, edge, maxLeft),
      top: clamp(
        targetRect.top + 20,
        edge + 52,
        Math.max(edge + 52, viewportHeight - calloutSize.height - 86),
      ),
    };
  }, [calloutSize.height, calloutSize.width, targetRect]);

  const prompt = step.action === "modal"
    ? "눌러서 열어보세요"
    : step.action === "click"
      ? "직접 눌러보세요"
      : "움직임을 확인해 보세요";

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-[140px] right-4 z-30 flex flex-col items-end gap-3 md:bottom-[84px] md:right-6">
          {showNudge && (
            <div className="relative w-[min(290px,calc(100vw-2rem))] rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
              <button
                type="button"
                onClick={dismissNudge}
                className="absolute right-2.5 top-2.5 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="사용법 안내 닫기"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="pr-7 text-sm font-extrabold text-slate-900">일정 만들기가 처음인가요?</p>
              <button
                type="button"
                onClick={openTutorial}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1344FF] hover:text-[#0d34cc]"
              >
                핵심만 빠르게 보기 <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={openTutorial}
            data-create-tutorial-trigger
            className="flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-3 text-sm font-extrabold text-[#1344FF] shadow-[0_12px_30px_rgba(15,23,42,0.14)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
            aria-label="일정 만들기 사용법 보기"
          >
            <CircleHelp className="h-5 w-5" />
            사용법
          </button>
        </div>
      )}

      {isOpen && !isModalActive && createPortal(
        <div className="pointer-events-none fixed inset-0 z-[70]" aria-live="polite">
          <style>{`
            @keyframes planmateTutorialDrag {
              0%, 18% { transform: translate3d(0, 0, 0) scale(1); }
              28% { transform: translate3d(0, -8px, 0) scale(1.04) rotate(-1deg); }
              70%, 100% { transform: translate3d(var(--tutorial-dx), var(--tutorial-dy), 0) scale(1); }
            }
            @keyframes planmateTutorialResize {
              0%, 18% { height: 74px; }
              68%, 100% { height: 136px; }
            }
            @keyframes planmateTutorialHandle {
              0%, 18% { transform: translateY(0); }
              68%, 100% { transform: translateY(62px); }
            }
            .planmate-tutorial-drag { animation: planmateTutorialDrag 2.6s cubic-bezier(.55,.08,.25,1) infinite; }
            .planmate-tutorial-resize { animation: planmateTutorialResize 1.7s cubic-bezier(.4,0,.2,1) infinite alternate; }
            .planmate-tutorial-handle { animation: planmateTutorialHandle 1.7s cubic-bezier(.4,0,.2,1) infinite alternate; }
            @media (prefers-reduced-motion: reduce) {
              .planmate-tutorial-drag, .planmate-tutorial-resize, .planmate-tutorial-handle { animation: none; }
              .planmate-tutorial-drag { transform: translate3d(var(--tutorial-dx), var(--tutorial-dy), 0); }
              .planmate-tutorial-resize { height: 112px; }
              .planmate-tutorial-handle { transform: translateY(38px); }
            }
          `}</style>

          {targetRect && !isStepPositionPending ? (
            <>
              <div className="pointer-events-auto fixed left-0 right-0 top-0" style={{ height: targetRect.top }} />
              <div className="pointer-events-auto fixed bottom-0 left-0 right-0" style={{ top: targetRect.bottom }} />
              <div className="pointer-events-auto fixed left-0" style={{ top: targetRect.top, width: targetRect.left, height: targetRect.height }} />
              <div className="pointer-events-auto fixed right-0" style={{ top: targetRect.top, left: targetRect.right, height: targetRect.height }} />
              <div
                data-create-tutorial-spotlight
                className="pointer-events-none fixed z-[71] rounded-2xl border-2 border-white shadow-[0_0_0_4px_rgba(19,68,255,0.72),0_0_0_9999px_rgba(2,6,23,0.65),0_14px_40px_rgba(15,23,42,0.25)] transition-all duration-300"
                style={{
                  left: targetRect.left,
                  top: targetRect.top,
                  width: targetRect.width,
                  height: targetRect.height,
                }}
              />
            </>
          ) : (
            <div className="pointer-events-auto fixed inset-0 bg-slate-950/65 backdrop-blur-[1px]" />
          )}

          <button
            type="button"
            onClick={closeTutorial}
            data-create-tutorial-close
            className="pointer-events-auto fixed right-4 top-4 z-[76] flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-slate-950/55 text-white shadow-lg backdrop-blur-md transition hover:bg-slate-950/80 sm:right-6 sm:top-6"
            aria-label="튜토리얼 바로 종료"
          >
            <X className="h-6 w-6" />
          </button>

          {step.kind === "drag" && demoLayout && (
            <>
              <div
                className={`pointer-events-none fixed z-[73] rounded-xl border-2 border-dashed border-blue-400 bg-blue-100/60 transition-opacity duration-150 ${
                  isUserInteracting ? "opacity-30" : "opacity-100"
                }`}
                style={{
                  left: demoLayout.endLeft,
                  top: demoLayout.endTop,
                  width: demoLayout.width,
                  height: 78,
                }}
              />
              <div
                className={`pointer-events-none fixed z-[74] transition-opacity duration-150 ${
                  isUserInteracting ? "opacity-30" : "opacity-100"
                }`}
                style={{
                  left: demoLayout.startLeft,
                  top: demoLayout.startTop,
                  width: demoLayout.width,
                  "--tutorial-dx": `${demoLayout.deltaX}px`,
                  "--tutorial-dy": `${demoLayout.deltaY}px`,
                }}
              >
                <div className="planmate-tutorial-drag relative flex h-[74px] items-center gap-3 rounded-xl border-l-4 border-l-lime-500 bg-lime-50 px-4 text-slate-900 shadow-2xl ring-1 ring-slate-900/10">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lime-100 text-lime-700">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <strong className="block truncate text-sm">성산일출봉</strong>
                    <span className="text-[11px] font-semibold text-lime-700">10:00 · 관광지</span>
                  </span>
                  <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1344FF] shadow-lg ring-1 ring-slate-200">
                    <Hand className="h-5 w-5 fill-blue-50" aria-label="드래그 중인 펼친 손 모양" />
                  </span>
                </div>
              </div>
            </>
          )}

          {step.kind === "resize" && demoLayout && (
            <div
              className={`pointer-events-none fixed z-[74] transition-opacity duration-150 ${
                isUserInteracting ? "opacity-30" : "opacity-100"
              }`}
              style={{ left: demoLayout.endLeft, top: demoLayout.endTop, width: demoLayout.width }}
            >
              <div className="planmate-tutorial-resize relative h-[74px] overflow-visible rounded-xl border-l-4 border-l-lime-500 bg-lime-50 px-4 py-3 shadow-2xl ring-1 ring-slate-900/10">
                <strong className="block truncate text-sm text-slate-900">성산일출봉</strong>
                <span className="text-[11px] font-semibold text-lime-700">10:00 · 체류시간 조절</span>
                <div className="absolute inset-x-3 bottom-[-6px] flex h-3 items-center justify-center rounded-full bg-[#1344FF] text-white shadow-md">
                  <GripHorizontal className="h-3 w-3" />
                </div>
              </div>
              <div className="planmate-tutorial-handle absolute bottom-[-27px] right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1344FF] shadow-lg">
                <MousePointerClick className="h-5 w-5" />
              </div>
            </div>
          )}

          <section
            ref={calloutRef}
            role={isIntroStep ? "dialog" : "status"}
            aria-label={`일정 만들기 사용법 ${stepIndex + 1}단계`}
            className={`pointer-events-auto fixed z-[75] w-[min(304px,calc(100vw-28px))] border border-white/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.3)] ${
              isIntroStep ? "rounded-[26px] p-6 text-center" : "rounded-2xl p-4"
            } ${isStepPositionPending ? "invisible" : ""}`}
            style={calloutStyle}
          >
            {isIntroStep ? (
              <>
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1344FF]">
                  <Sparkles className="h-6 w-6" />
                </span>
                <h2 className="mt-4 break-keep text-xl font-black tracking-[-0.03em] text-slate-950">{step.title}</h2>
                <p className="mt-2 break-keep text-sm leading-6 text-slate-600">{step.description}</p>
                <button
                  type="button"
                  onClick={nextStep}
                  data-create-tutorial-next
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1344FF] px-5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(19,68,255,0.28)] transition hover:bg-[#0d34cc]"
                >
                  직접 만들어보기
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1344FF]">
                  <MousePointerClick className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="break-keep text-base font-black tracking-[-0.02em] text-slate-950">{step.title}</h2>
                  <p className="mt-1 break-keep text-xs leading-5 text-slate-600">{step.description}</p>
                  <p className="mt-2 text-[11px] font-extrabold text-[#1344FF]">{prompt}</p>
                </div>
              </div>
            )}
          </section>

          {!isIntroStep && !isStepPositionPending && (
            <div className="pointer-events-auto fixed bottom-20 left-1/2 z-[76] flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-6">
              <div className="rounded-full border border-white/25 bg-slate-950/60 px-3 py-1 text-xs font-bold tabular-nums text-white shadow-lg backdrop-blur-md">
                {Math.min(stepIndex + 1, tutorialStepCount)} / {tutorialStepCount}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={previousStep}
                  disabled={stepIndex === 0}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 shadow-[0_14px_32px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                  aria-label="이전 튜토리얼 단계로 이동"
                >
                  <ArrowLeft className="h-4 w-4" /> 이전
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  data-create-tutorial-next
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1344FF] px-6 text-sm font-extrabold text-white shadow-[0_14px_32px_rgba(19,68,255,0.4)] transition hover:-translate-y-0.5 hover:bg-[#0d34cc]"
                  aria-label="이 단계를 건너뛰고 다음으로 이동"
                >
                  다음 <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
