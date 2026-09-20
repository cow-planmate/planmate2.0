import {
  AlertCircle,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Info,
  LoaderCircle,
  MapPin,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApiClient } from "../../hooks/useApiClient";
import usePlanStore from "../../store/Plan";
import { mapPlaceSummary } from "../../utils/createUtils";
import PlaceDetailModal from "../Create2/Place/PlaceDetailModal";
import { TourApiAttribution } from "../common/TourApiAttribution";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  text: "일정을 어떻게 바꿔볼까요? 장소 추천부터 일정 순서 조정까지 편하게 말해 주세요.",
};

const QUICK_PROMPTS = [
  "첫째 날 동선을 더 짧게 정리해 줘",
  "근처 맛집을 몇 곳 추천해 줘",
  "비 오는 날 가기 좋은 장소를 알려 줘",
];

const CATEGORY_LABELS = {
  ATTRACTION: "관광지",
  ACCOMMODATION: "숙소",
  RESTAURANT: "식당",
  FREE: "직접 추가",
  SEARCH: "검색 장소",
};

const newMessageId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getErrorMessage = (error, mode) => {
  if (error?.code === "CHATBOT_003" || error?.status === 409) {
    return "반영 세션이 만료됐어요. 페이지를 새로고침한 뒤 다시 시도해 주세요.";
  }
  if (error?.status === 403) return "이 일정을 편집할 권한이 있는 멤버만 AI 도우미를 사용할 수 있어요.";
  if (error?.status === 404) return "AI 도우미 API가 아직 연결되지 않았어요. 잠시 후 다시 시도해 주세요.";
  if (mode === "apply") {
    return "제안을 반영하지 못했어요. 일부 변경이 보인다면 새로고침해 최신 일정을 확인해 주세요.";
  }
  return "AI가 잠시 응답하지 못했어요. 잠시 후 다시 시도해 주세요.";
};

const getPlanName = (plan) =>
  plan?.planFrame?.planName ?? plan?.planFrame?.name ?? "일정 변경 제안";

const formatBlockTime = (block) => {
  const start = block?.blockStartTime?.slice?.(0, 5);
  const end = block?.blockEndTime?.slice?.(0, 5);
  return start && end ? `${start}–${end}` : start ?? "시간 미정";
};

const getOverviewText = (value) =>
  typeof value === "string"
    ? value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim()
    : "";

const InlineMarkdown = ({ text }) => {
  const parts = String(text ?? "").split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-extrabold">
          {part.slice(2, -2).trim()}
        </strong>
      );
    }

    return part;
  });
};

const SuggestedPlaces = ({ places, onShowDetail }) => {
  if (!places.length) return null;

  return (
    <section className="mx-4 mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm" aria-label="AI 추천 장소">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <MapPin className="h-3.5 w-3.5" />
        </span>
        <div>
          <h3 className="text-xs font-extrabold text-slate-900">추천 장소</h3>
          <p className="text-[10px] font-medium text-slate-400">이어서 조건을 바꿔 물어볼 수 있어요</p>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {places.map((place) => (
          <article
            key={`${place.contentId}-${place.title}`}
            className="w-[178px] flex-none overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            {place.thumbnailUrl ? (
              <img src={place.thumbnailUrl} alt="" className="h-20 w-full object-cover" />
            ) : (
              <div className="flex h-20 items-center justify-center bg-slate-100 text-slate-300">
                <MapPin className="h-6 w-6" />
              </div>
            )}
            <div className="p-2.5">
              <span className="text-[10px] font-bold text-[#1344FF]">
                {CATEGORY_LABELS[place.category] ?? place.category ?? "여행 장소"}
              </span>
              <h4 className="mt-0.5 truncate text-xs font-extrabold text-slate-900">
                <InlineMarkdown text={place.title} />
              </h4>
              {getOverviewText(place.overview) ? (
                <p className="mt-2 line-clamp-2 text-[10px] font-medium leading-4 text-slate-500">
                  {getOverviewText(place.overview)}
                </p>
              ) : null}
              {place.contentId != null ? (
                <button
                  type="button"
                  onClick={() => onShowDetail(place)}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-slate-50 px-2 py-1.5 text-[10px] font-extrabold text-slate-600 transition hover:bg-blue-50 hover:text-[#1344FF]"
                >
                  <Info className="h-3 w-3" /> 자세히
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <TourApiAttribution className="mt-3 border-t border-slate-100 pt-2.5" />
    </section>
  );
};

const PlanPreview = ({ plan, isApplying, onApply, onDiscard }) => {
  if (!plan) return null;

  const timetables = Array.isArray(plan.timetables) ? plan.timetables : [];
  const blocks = Array.isArray(plan.placeBlocks) ? plan.placeBlocks : [];

  return (
    <section className="mx-4 mb-3 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-[0_8px_24px_rgba(19,68,255,0.08)]" aria-label="AI 일정 변경 미리보기">
      <div className="flex items-start justify-between gap-3 bg-blue-50/80 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#1344FF]">
            <Sparkles className="h-3.5 w-3.5" />
            변경 미리보기
          </div>
          <h3 className="mt-1 truncate text-sm font-black text-slate-950">{getPlanName(plan)}</h3>
        </div>
        <span className="flex-none rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-blue-100">
          아직 미반영
        </span>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-[#1344FF]" /> {timetables.length}일
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#1344FF]" /> {blocks.length}개 장소
          </span>
        </div>

        {blocks.length > 0 && (
          <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
            {blocks.slice(0, 3).map((block, index) => (
              <div key={block.blockId ?? `${block.date}-${block.blockStartTime}-${index}`} className="flex min-w-0 items-center gap-2 text-[11px]">
                <span className="w-16 flex-none font-bold tabular-nums text-slate-400">{formatBlockTime(block)}</span>
                <span className="truncate font-bold text-slate-700">{block.placeName}</span>
              </div>
            ))}
            {blocks.length > 3 && (
              <p className="pl-[72px] text-[10px] font-semibold text-slate-400">외 {blocks.length - 3}개 장소</p>
            )}
          </div>
        )}

        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[10px] font-medium leading-4 text-slate-500">
          내용을 더 바꾸고 싶다면 아래 입력창에서 이어서 요청하세요.
        </p>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-2 border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={onDiscard}
          disabled={isApplying}
          className="rounded-xl px-3 py-2.5 text-xs font-extrabold text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
        >
          제안 취소
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={isApplying}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-[#1344FF] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(19,68,255,0.22)] transition hover:bg-[#0d34cc] disabled:cursor-wait disabled:opacity-70"
        >
          {isApplying ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          {isApplying ? "반영 중..." : "이 일정에 반영"}
        </button>
      </div>
    </section>
  );
};

const ChatBot = ({ planId: explicitPlanId }) => {
  const [searchParams] = useSearchParams();
  const storePlanId = usePlanStore((state) => state.planId);
  const planId = explicitPlanId ?? searchParams.get("id") ?? storePlanId;
  const canUseChatbot = Boolean(planId && String(planId) !== "-1" && String(planId) !== "0");
  const { post } = useApiClient();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [shownPlaces, setShownPlaces] = useState([]);
  const [detailPlace, setDetailPlace] = useState(null);
  const [notice, setNotice] = useState(null);
  const [panelSize, setPanelSize] = useState({ width: 480, height: 740 });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const resizeStateRef = useRef(null);

  const planSummary = {
    dayCount: pendingPlan?.timetables?.length ?? 0,
    placeCount: pendingPlan?.placeBlocks?.length ?? 0,
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isApplying, isSending, messages, pendingPlan, shownPlaces]);

  useEffect(() => {
    if (isOpen) window.setTimeout(() => inputRef.current?.focus(), 80);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerMove = (event) => {
      const resizeState = resizeStateRef.current;
      if (!resizeState) return;

      const maxWidth = Math.max(390, window.innerWidth - 48);
      const maxHeight = Math.max(320, window.innerHeight - 116);
      const width = resizeState.axis.includes("x")
        ? resizeState.width + resizeState.x - event.clientX
        : resizeState.width;
      const height = resizeState.axis.includes("y")
        ? resizeState.height + resizeState.y - event.clientY
        : resizeState.height;

      setPanelSize({
        width: Math.min(maxWidth, Math.max(390, width)),
        height: Math.min(maxHeight, Math.max(320, height)),
      });
    };

    const handlePointerUp = () => {
      const resizeState = resizeStateRef.current;
      if (!resizeState) return;
      resizeStateRef.current = null;
      document.body.style.cursor = resizeState.previousCursor;
      document.body.style.userSelect = resizeState.previousUserSelect;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      handlePointerUp();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isOpen]);

  useEffect(() => {
    setMessages([WELCOME_MESSAGE]);
    setInputMessage("");
    setPendingPlan(null);
    setShownPlaces([]);
    setDetailPlace(null);
    setNotice(null);
  }, [planId]);

  const appendAssistantMessage = (text) => {
    setMessages((current) => [
      ...current,
      { id: newMessageId(), role: "assistant", text },
    ]);
  };

  const sendMessage = async (messageOverride) => {
    const message = (messageOverride ?? inputMessage).trim();
    if (!message || isSending || isApplying || !canUseChatbot) return;

    const userMessage = { id: newMessageId(), role: "user", text: message };
    setMessages((current) => [...current, userMessage]);
    setInputMessage("");
    setNotice(null);
    setIsSending(true);

    try {
      const response = await post(`${import.meta.env.VITE_API_URL}/api/plan/${planId}/chatbot`, {
        message,
        pendingContext: pendingPlan ?? null,
        shownPlaces: shownPlaces.filter((place) => place.contentId != null).map((place) => ({
          contentId: String(place.contentId),
          title: place.title,
          category: place.category,
        })),
        recentMessages: messages
          .filter((item) => item.role === "user")
          .slice(-3)
          .map((item) => item.text.slice(0, 500)),
      });

      const result = response?.data ?? response ?? {};
      appendAssistantMessage(result.userMessage || "요청을 확인했어요. 원하는 내용을 조금 더 자세히 알려 주세요.");
      if (result.plan) setPendingPlan(result.plan);
      setShownPlaces(Array.isArray(result.shownPlaces) ? result.shownPlaces : []);
    } catch (error) {
      appendAssistantMessage(getErrorMessage(error, "chat"));
    } finally {
      setIsSending(false);
    }
  };

  const applyPendingPlan = async () => {
    if (!pendingPlan || isApplying || !canUseChatbot) return;

    setNotice(null);
    setIsApplying(true);
    try {
      const response = await post(`${import.meta.env.VITE_API_URL}/api/plan/${planId}/chatbot-apply`, {
        plan: pendingPlan,
      });
      const result = response?.data ?? response ?? {};
      setPendingPlan(null);
      setShownPlaces([]);
      appendAssistantMessage("제안한 내용을 일정에 반영했어요. 변경된 블록을 시간표에서 확인해 보세요.");
      setNotice({
        type: result.conflictDetected ? "warning" : "success",
        text: result.conflictDetected
          ? "대화 중 다른 멤버가 일정을 수정했어요. 결과를 확인하고 필요하면 상단의 되돌리기를 사용해 주세요."
          : "일정 반영이 완료됐어요.",
      });
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error, "apply") });
    } finally {
      setIsApplying(false);
    }
  };

  const discardPendingPlan = () => {
    setPendingPlan(null);
    setShownPlaces([]);
    setNotice({ type: "neutral", text: "변경 제안을 취소했어요. 현재 저장된 일정은 그대로예요." });
  };

  const resetConversation = () => {
    setMessages([WELCOME_MESSAGE]);
    setInputMessage("");
    setPendingPlan(null);
    setShownPlaces([]);
    setDetailPlace(null);
    setNotice(null);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const startResize = (axis, event) => {
    if (window.innerWidth < 768) return;
    event.preventDefault();
    event.stopPropagation();
    resizeStateRef.current = {
      axis,
      x: event.clientX,
      y: event.clientY,
      previousCursor: document.body.style.cursor,
      previousUserSelect: document.body.style.userSelect,
      ...panelSize,
    };
    document.body.style.cursor = axis === "xy" ? "nwse-resize" : axis === "x" ? "ew-resize" : "ns-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`fixed bottom-20 right-4 z-[45] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_14px_34px_rgba(19,68,255,0.34)] transition hover:-translate-y-0.5 md:bottom-6 md:right-6 ${isOpen ? "bg-slate-800 hover:bg-slate-700" : "bg-[#1344FF] hover:bg-[#0d34cc]"}`}
        aria-label={isOpen ? "AI 여행 도우미 닫기" : "AI 여행 도우미 열기"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {isOpen && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="planmate-ai-title"
          className="fixed inset-x-3 bottom-[148px] z-[44] flex h-[min(680px,calc(100dvh-172px))] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.24)] md:inset-x-auto md:bottom-[92px] md:right-6 md:h-[var(--chatbot-height)] md:min-h-[320px] md:w-[var(--chatbot-width)] md:min-w-[390px] md:max-h-[calc(100dvh-116px)] md:max-w-[calc(100vw-3rem)]"
          style={{
            "--chatbot-width": `${panelSize.width}px`,
            "--chatbot-height": `${panelSize.height}px`,
          }}
        >
          <div
            aria-hidden="true"
            onPointerDown={(event) => startResize("x", event)}
            className="group absolute bottom-5 left-0 top-5 z-50 hidden w-2 -translate-x-1/2 cursor-ew-resize md:block"
          >
            <span className="absolute bottom-8 left-1/2 top-8 w-0.5 -translate-x-1/2 rounded-full bg-transparent transition group-hover:bg-[#1344FF]/35" />
          </div>
          <div
            aria-hidden="true"
            onPointerDown={(event) => startResize("y", event)}
            className="group absolute left-5 right-5 top-0 z-50 hidden h-2 -translate-y-1/2 cursor-ns-resize md:block"
          >
            <span className="absolute left-8 right-8 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-transparent transition group-hover:bg-[#1344FF]/35" />
          </div>
          <div
            aria-hidden="true"
            onPointerDown={(event) => startResize("xy", event)}
            className="absolute -left-1 -top-1 z-[51] hidden h-5 w-5 cursor-nwse-resize md:block"
          />
          <header className="flex flex-none items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-blue-50 text-[#1344FF]">
                <Bot className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 id="planmate-ai-title" className="truncate text-sm font-black text-slate-950">AI 여행 도우미</h2>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                  <Sparkles className="h-3 w-3 text-[#1344FF]" /> 일정 추천부터 수정까지
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetConversation}
              className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" /> 새 대화
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 py-4">
            {!canUseChatbot ? (
              <div className="mx-4 flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1344FF]">
                  <Bot className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-sm font-black text-slate-900">저장된 일정에서 사용할 수 있어요</h3>
                <p className="mt-2 break-keep text-xs leading-5 text-slate-500">
                  일정을 먼저 저장한 뒤 AI에게 장소 추천과 일정 수정을 요청해 보세요.
                </p>
              </div>
            ) : (
              <>
                {notice && (
                  <div className={`mx-4 mb-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[11px] font-semibold leading-4 ${
                    notice.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : notice.type === "warning"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : notice.type === "error"
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-slate-200 bg-white text-slate-600"
                  }`} role="status">
                    {notice.type === "success" ? <Check className="mt-0.5 h-3.5 w-3.5 flex-none" /> : <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none" />}
                    {notice.text}
                  </div>
                )}

                <div className="space-y-3 px-4">
                  {messages.map((message, index) => (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-5 ${
                        message.role === "user"
                          ? "rounded-br-md bg-[#1344FF] text-white shadow-[0_6px_16px_rgba(19,68,255,0.18)]"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                      }`}>
                        <p className="whitespace-pre-wrap break-words">
                          <InlineMarkdown text={message.text} />
                        </p>
                        {index > 0 && (
                          <span className={`mt-1 flex items-center gap-1 text-[9px] ${message.role === "user" ? "text-blue-100" : "text-slate-400"}`}>
                            <Clock3 className="h-2.5 w-2.5" /> 방금
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {messages.length === 1 && (
                    <div className="space-y-1.5 pt-1">
                      {QUICK_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => void sendMessage(prompt)}
                          className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-[11px] font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50/60 hover:text-[#1344FF]"
                        >
                          <span className="truncate">{prompt}</span>
                          <ChevronRight className="h-3.5 w-3.5 flex-none" />
                        </button>
                      ))}
                    </div>
                  )}

                  {isSending && (
                    <div className="flex justify-start">
                      <div className="max-w-[84%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <LoaderCircle className="h-4 w-4 animate-spin text-[#1344FF]" /> 일정을 살펴보고 있어요
                        </div>
                        <p className="mt-1 text-[10px] font-medium text-slate-400">내용에 따라 최대 40초 정도 걸릴 수 있어요.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <SuggestedPlaces places={shownPlaces} onShowDetail={setDetailPlace} />
                  <PlanPreview
                    plan={pendingPlan}
                    isApplying={isApplying}
                    onApply={applyPendingPlan}
                    onDiscard={discardPendingPlan}
                  />
                </div>
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <footer className="flex-none border-t border-slate-100 bg-white p-3">
            {pendingPlan && (
              <div className="mb-2 flex items-center gap-1.5 px-1 text-[10px] font-bold text-[#1344FF]">
                <Sparkles className="h-3 w-3" /> {planSummary.dayCount}일 · {planSummary.placeCount}개 장소 제안을 이어서 수정 중
              </div>
            )}
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(event) => setInputMessage(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={canUseChatbot ? "원하는 일정이나 장소를 말해 주세요" : "일정을 저장하면 사용할 수 있어요"}
                rows={1}
                maxLength={1000}
                disabled={!canUseChatbot || isSending || isApplying}
                className="max-h-24 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-xs font-medium leading-5 text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!canUseChatbot || !inputMessage.trim() || isSending || isApplying}
                className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[#1344FF] text-white transition hover:bg-[#0d34cc] disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="메시지 보내기"
              >
                {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-center text-[9px] font-medium text-slate-400">AI 제안은 반영 전 미리 확인해 주세요.</p>
          </footer>
        </section>
      )}
      {detailPlace ? (
        <PlaceDetailModal
          contentId={detailPlace.contentId}
          fallbackPlace={mapPlaceSummary(detailPlace)}
          onClose={() => setDetailPlace(null)}
        />
      ) : null}
    </>
  );
};

export default ChatBot;
