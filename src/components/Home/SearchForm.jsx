import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCalendar,
  faLocationDot,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import previewImage from "../../assets/imgs/bg3.jpg";

const formatPreviewDate = (date) =>
  date?.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }) ?? "날짜를 선택해 주세요";

function PlannerField({
  icon,
  label,
  value,
  placeholder,
  onClick,
  isLast = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex min-h-[72px] w-full items-center gap-3 bg-white px-4 py-3 text-left transition-colors hover:z-10 hover:bg-blue-50/60 focus:outline-none focus-visible:z-20 focus-visible:bg-blue-50/70 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-main lg:min-h-[78px] lg:gap-4 lg:px-5 lg:py-4 ${
        isLast ? "" : "border-b border-slate-300"
      }`}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-main transition-colors group-hover:border-blue-200 group-hover:bg-white lg:size-11">
        <FontAwesomeIcon icon={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="mb-1 block text-xs font-semibold text-gray-500">
          {label}
        </span>
        <span
          className={`block truncate text-sm font-semibold ${
            value ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {value || placeholder}
        </span>
      </span>
      <FontAwesomeIcon
        icon={faArrowRight}
        className="text-xs text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-main"
      />
    </button>
  );
}

function SearchForm({
  destinationName,
  onDestinationClick,
  dateRangeText,
  onCalendarClick,
  personCountText,
  onPersonCountClick,
  startDate,
  endDate,
  adultCount,
  childCount,
  isSubmitting,
  onSubmit,
}) {
  const dayCount =
    startDate && endDate
      ? Math.max(
          1,
          Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1,
        )
      : null;
  const nights = dayCount ? Math.max(0, dayCount - 1) : null;

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white font-pretendard">
      <div className="grid min-h-[calc(100vh-4rem)] md:grid-cols-[minmax(340px,44%)_minmax(0,1fr)] lg:grid-cols-[minmax(380px,38%)_minmax(0,1fr)]">
          <div className="relative z-10 order-2 -mt-6 flex flex-col justify-center rounded-t-[1.75rem] bg-white px-5 pb-10 pt-8 sm:px-8 md:order-1 md:mt-0 md:-translate-y-4 md:rounded-none md:px-6 md:py-10 lg:-translate-y-6 lg:px-[clamp(2.5rem,5vw,6.5rem)] lg:py-12 xl:-translate-y-8 xl:px-[clamp(4rem,7vw,8rem)]">
            <div className="mb-6 hidden max-w-lg md:block lg:mb-8">
              <span className="mb-4 inline-flex rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold tracking-wide text-main">
                PLAN YOUR NEXT TRIP
              </span>
              <h1 className="text-3xl font-bold leading-[1.16] text-gray-950 sm:text-4xl lg:text-[2.65rem]">
                떠나고 싶은 여행을
                <br />
                계획해 보세요
              </h1>
              <p className="mt-4 text-sm leading-6 text-gray-500 sm:text-base">
                여행지와 기간, 함께하는 인원을 선택하면 나만의 일정을 만들 수 있어요.
              </p>
            </div>

            <p className="mb-4 text-sm font-semibold text-gray-900 md:hidden">
              여행 정보를 선택해 주세요
            </p>

            <div className="overflow-hidden rounded-[1.5rem] border border-slate-400/80 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
              <PlannerField
                icon={faLocationDot}
                label="여행지"
                value={destinationName}
                placeholder="여행지를 선택해 주세요"
                onClick={onDestinationClick}
              />
              <PlannerField
                icon={faCalendar}
                label="여행 기간"
                value={dateRangeText}
                placeholder="날짜를 선택해 주세요"
                onClick={onCalendarClick}
              />
              <PlannerField
                icon={faUser}
                label="함께하는 인원"
                value={personCountText}
                placeholder="인원을 선택해 주세요"
                onClick={onPersonCountClick}
                isLast
              />
            </div>

            <button
              disabled={isSubmitting}
              onClick={onSubmit}
              type="button"
              className={`mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 font-semibold text-white shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-main focus-visible:ring-offset-2 lg:mt-6 ${
                isSubmitting
                  ? "cursor-not-allowed bg-gray-400 shadow-none"
                  : "bg-main shadow-blue-200 hover:-translate-y-0.5 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "일정을 만드는 중..." : "나만의 일정 만들기"}
              {!isSubmitting && <FontAwesomeIcon icon={faArrowRight} />}
            </button>
          </div>

          <div className="relative order-1 min-h-[280px] overflow-hidden sm:min-h-[320px] md:order-2 md:min-h-[calc(100vh-4rem)]">
            <img
              src={previewImage}
              alt="여행 분위기를 보여주는 미리보기"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/25 to-slate-950/10" />

            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md sm:left-8 sm:top-8 lg:left-10 lg:top-10">
              <span className="size-1.5 rounded-full bg-blue-300" />
              TRIP PREVIEW
            </div>

            <div className="absolute inset-x-0 bottom-10 px-5 text-white sm:px-8 md:hidden">
              <p className="mb-2 text-xs font-semibold tracking-wide text-white/75">
                PLAN YOUR NEXT TRIP
              </p>
              <h1 className="text-[2rem] font-bold leading-[1.15] drop-shadow-sm sm:text-4xl">
                떠나고 싶은 여행을
                <br />
                계획해 보세요
              </h1>
              <p className="mt-3 max-w-md text-sm leading-5 text-white/80">
                여행지와 기간, 함께하는 인원을 선택해 나만의 일정을 만들어 보세요.
              </p>
            </div>

            <div className="absolute inset-x-0 bottom-0 hidden p-8 text-white md:block lg:p-10 xl:p-14">
              <p className="mb-2 text-sm font-medium text-white/70">NEXT DESTINATION</p>
              <h2 className="text-4xl font-bold leading-tight drop-shadow-sm sm:text-5xl">
                {destinationName || "다음 여행은 어디인가요?"}
              </h2>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/25 pt-5 lg:grid-cols-3">
                <div className="col-span-2 lg:col-span-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                    Date
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatPreviewDate(startDate)}
                  </p>
                  {endDate && (
                    <p className="mt-0.5 text-xs text-white/70">
                      ~ {formatPreviewDate(endDate)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                    Duration
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {dayCount ? `${nights}박 ${dayCount}일` : "기간 미정"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                    Travelers
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    성인 {adultCount} · 아동 {childCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
      </div>
    </section>
  );
}

export default SearchForm;
