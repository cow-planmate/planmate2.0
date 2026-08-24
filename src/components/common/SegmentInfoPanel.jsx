import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCar,
  faBus,
  faPersonWalking,
  faRoute,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { useApiClient } from "../../hooks/useApiClient";

// 버스 종류 코드 → 표기 라벨 (알 수 없으면 null)
const BUS_TYPE_LABELS = {
  1: "일반",
  2: "좌석",
  3: "마을",
  4: "직행",
  5: "공항",
  6: "간선",
};

// 지하철 노선 코드 → 노선색 (알 수 없으면 기본색). 지도 폴리라인에서도 재사용하도록 export.
// eslint-disable-next-line react-refresh/only-export-components
export const SUBWAY_COLORS = {
  1: "#0052A4",
  2: "#00A84D",
  3: "#EF7C1C",
  4: "#00A5DE",
  5: "#996CAC",
  6: "#CD7C2F",
  7: "#747F00",
  8: "#E6186C",
  9: "#BDB092",
};
const DEFAULT_SUBWAY_COLOR = "#3B82F6";
export const BUS_COLOR = "#33B540";

// 분 → "X분" / "H시간 M분"
const formatMinutes = (minutes) => {
  if (minutes == null || Number.isNaN(minutes)) return null;
  const rounded = Math.round(minutes);
  if (rounded >= 60) {
    const hours = Math.floor(rounded / 60);
    const rest = rounded % 60;
    return rest > 0 ? `${hours}시간 ${rest}분` : `${hours}시간`;
  }
  return `${rounded}분`;
};

// 초 → "X분" (최소 1분)
const formatSeconds = (seconds) => {
  if (seconds == null || Number.isNaN(seconds)) return null;
  return formatMinutes(Math.max(1, Math.round(seconds / 60)));
};

// 미터 → "850m" / "3.4km"
const formatMeters = (meters) => {
  if (meters == null || Number.isNaN(meters)) return null;
  return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
};

// 요금 → "1,550원"
const formatPayment = (payment) => {
  if (payment == null || Number.isNaN(payment)) return null;
  return `${payment.toLocaleString()}원`;
};

// null인 항목을 제외하고 " · "로 연결. 전부 null이면 null
const joinParts = (...parts) => {
  const filtered = parts.filter(Boolean);
  return filtered.length > 0 ? filtered.join(" · ") : null;
};

const SegmentRow = ({ icon, label, value, isLoading, title, tone = "blue" }) => (
  <div
    className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
    title={title}
  >
    <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg ${
      tone === "green" ? "bg-emerald-50 text-emerald-600" : tone === "gray" ? "bg-white text-slate-500" : "bg-blue-50 text-main"
    }`}>
      <FontAwesomeIcon icon={icon} className="text-sm" />
    </span>
    <span className="sr-only">{label}</span>
    {isLoading ? (
      <span className="h-4 w-16 animate-pulse rounded bg-slate-200" aria-label={`${label} 정보 불러오는 중`} />
    ) : (
      <span className="min-w-0 text-sm font-semibold text-slate-700">{value ?? "정보 없음"}</span>
    )}
  </div>
);

const NumberBadge = ({ number }) => (
  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-main text-xs font-bold text-white shadow-sm shadow-blue-200">
    {number}
  </span>
);

// 스텝의 색상(버스/지하철/도보)을 구한다.
const stepColor = (step) => {
  if (step.trafficType === 2) return BUS_COLOR;
  if (step.trafficType === 1) return SUBWAY_COLORS[step.subwayCode] || DEFAULT_SUBWAY_COLOR;
  return null; // 도보는 Tailwind bg-slate-300 사용
};

// 경로 하나의 비율 막대(도보=회색, 버스=초록, 지하철=노선색). 폭 ∝ sectionTime.
const RouteBar = ({ steps }) => (
  <div className="mb-3 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
    {steps.map((step, i) => {
      const isWalk = step.trafficType === 3;
      const color = stepColor(step);
      return (
        <div
          key={i}
          style={{ flexGrow: step.sectionTime || 1, backgroundColor: color ?? undefined }}
          className={`flex min-w-[8px] items-center justify-center gap-0.5 overflow-hidden ${
            isWalk ? "bg-slate-300" : ""
          }`}
        >
        </div>
      );
    })}
  </div>
);

// 구간의 경유 정류장 목록 토글. 행마다 독립적인 펼침 상태를 가진다.
const PassStopsToggle = ({ passStops }) => {
  const [open, setOpen] = useState(false);

  if (!passStops || passStops.length === 0) return null;

  return (
    <div className="pl-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-[11px] font-medium text-slate-400 transition hover:text-slate-600"
      >
        경유 정류장 {passStops.length}개
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="text-[9px]" />
      </button>
      {open && (
        <ul className="mt-1 space-y-1 border-l border-dashed border-slate-200 pl-3">
          {passStops.map((stop, i) => (
            <li key={i} className="text-xs text-slate-500">
              {stop.stationName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// 경로 하나의 대중교통 상세 스텝 행(도보 제외).
const RouteDetailRow = ({ step }) => {
  let rowContent = null;

  if (step.trafficType === 2) {
    rowContent = (
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
        <span className="rounded-md bg-green-50 px-1.5 py-0.5 font-semibold text-green-700">
          {BUS_TYPE_LABELS[step.busType] || "버스"}
        </span>
        {step.startName && <span>{step.startName}</span>}
        {step.laneName && (
          <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-bold">
            {step.laneName}
          </span>
        )}
        {step.intervalTime != null && (
          <span className="text-slate-400">배차 {step.intervalTime}분</span>
        )}
      </div>
    );
  } else if (step.trafficType === 1) {
    const color = SUBWAY_COLORS[step.subwayCode] || DEFAULT_SUBWAY_COLOR;
    rowContent = (
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
        <span
          style={{ backgroundColor: color }}
          className="rounded-md px-1.5 py-0.5 font-semibold text-white"
        >
          {step.laneName || "지하철"}
        </span>
        <span>
          {step.startName}역 승차 ~ {step.endName}역 하차
        </span>
        {step.startExitNo && <span className="text-slate-400">{step.startExitNo}번 출구</span>}
        {step.intervalTime != null && (
          <span className="text-slate-400">배차 {step.intervalTime}분</span>
        )}
      </div>
    );
  }

  if (!rowContent) return null;

  return (
    <div className="relative space-y-1 border-l-2 border-slate-100 py-1 pl-3 before:absolute before:-left-[5px] before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-slate-300">
      {rowContent}
      <PassStopsToggle passStops={step.passStops} />
    </div>
  );
};

// 네이버 지도 스타일 다중 경로 뷰. 필터 칩 + 경로 카드 목록.
// 칩 개수는 result 레벨의 실제 전체 개수(busCount 등), 필터링은 실제 보유한 routes에 적용.
const TransitRoutes = ({
  routes,
  busCount,
  subwayCount,
  subwayBusCount,
  segmentIndex,
  onShowTransitRoute,
  activeTransitKey,
}) => {
  const [selected, setSelected] = useState("전체");

  const chips = [
    { key: "전체", label: "전체" },
    { key: 2, label: `버스 ${busCount ?? 0}` },
    { key: 1, label: `지하철 ${subwayCount ?? 0}` },
    { key: 3, label: `버스+지하철 ${subwayBusCount ?? 0}` },
  ];

  const filtered = selected === "전체" ? routes : routes.filter((r) => r.pathType === selected);

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => setSelected(chip.key)}
            className={`flex-none rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              selected === chip.key
                ? "bg-main text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {filtered.map((route, ri) => {
        const transferCount =
          (route.busTransitCount ?? 0) + (route.subwayTransitCount ?? 0);
        const subtitle = joinParts(
          transferCount > 0 ? `환승 ${transferCount}회` : null,
          route.totalWalk ? `도보 ${route.totalWalk}m` : null
        );
        const laneKey = `${segmentIndex}-${ri}`;
        const laneActive = activeTransitKey === laneKey;

        return (
          <div key={ri} className="mb-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-blue-200">
            <div className="flex items-baseline justify-between">
              <div><span className="text-xl font-extrabold tracking-tight text-slate-900">{route.totalTime}</span><span className="ml-0.5 text-sm font-bold text-slate-600">분</span></div>
              <span className="text-xs font-medium text-slate-500">
                {route.payment?.toLocaleString()}원
              </span>
            </div>
            {subtitle && <div className="mb-3 mt-0.5 text-xs font-medium text-slate-400">{subtitle}</div>}

            <RouteBar steps={route.steps} />

            <div className="space-y-1.5">
              {route.steps.map((step, si) =>
                step.trafficType === 3 ? null : <RouteDetailRow key={si} step={step} />
              )}
            </div>

            {route.lastEndStation && (
              <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500"><span className="h-2 w-2 rounded-full border-2 border-slate-400" />{route.lastEndStation} 하차</div>
            )}

            {onShowTransitRoute && route.mapObj && (
              <button
                type="button"
                onClick={() => onShowTransitRoute(route.mapObj, laneKey)}
                className={`mt-3 w-full rounded-xl py-2 text-xs font-bold transition ${
                  laneActive
                    ? "bg-slate-800 text-white"
                    : "bg-blue-50 text-main hover:bg-blue-100"
                }`}
              >
                {laneActive ? "지도에서 숨기기" : "지도에 보기"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

// 대중교통 요약 행 + 다중 경로(펼침/접힘). 세그먼트마다 독립적으로 상태를 가진다.
const TransitInfo = ({ transit, isLoading, segmentIndex, onShowTransitRoute, activeTransitKey }) => {
  const [expanded, setExpanded] = useState(false);

  const available = transit?.available && transit.routes?.length;
  const best = available ? transit.routes[0] : null;
  const transferCount = best
    ? (best.busTransitCount ?? 0) + (best.subwayTransitCount ?? 0)
    : 0;

  return (
    <div>
      <SegmentRow
        icon={faBus}
        label="대중교통"
        tone="green"
        isLoading={isLoading}
        title={!available ? transit?.message ?? undefined : undefined}
        value={
          available
            ? joinParts(
                formatMinutes(best.totalTime),
                formatPayment(best.payment),
                transferCount > 0 ? `환승 ${transferCount}회` : null
              )
            : null
        }
      />
      {available && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-white py-2 text-xs font-bold text-main ring-1 ring-slate-100 transition hover:bg-blue-50"
          >
            {expanded ? "접기" : `경로 ${transit.routes.length}개 보기`}
            <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} className="text-[10px]" />
          </button>
          {expanded && (
            <TransitRoutes
              routes={transit.routes}
              busCount={transit.busCount}
              subwayCount={transit.subwayCount}
              subwayBusCount={transit.subwayBusCount}
              segmentIndex={segmentIndex}
              onShowTransitRoute={onShowTransitRoute}
              activeTransitKey={activeTransitKey}
            />
          )}
        </>
      )}
    </div>
  );
};

/**
 * 구간 정보 패널
 * 일정의 연속한 두 장소 사이 이동 시간(차량/도보/대중교통)을 보여준다.
 * ODsay 호출량이 제한적이므로 패널을 처음 열 때(positionsKey 기준)만 조회하고,
 * 같은 좌표 조합은 캐시된 결과를 재사용한다.
 */
export default function SegmentInfoPanel({
  sortedSchedule,
  positions,
  positionsKey,
  onShowTransitRoute,
  activeTransitKey,
  isOpen,
  onOpenChange,
  panelVariant = "floating",
}) {
  const { post } = useApiClient();

  const [segmentData, setSegmentData] = useState({
    key: null,
    driving: null,
    foot: null,
    transit: [],
    hasError: false,
  });

  // 현재 좌표 조합의 결과가 아직 없으면 로딩 중으로 간주
  const isLoading = isOpen && segmentData.key !== positionsKey;

  // ODsay 호출량 보호: 닫아도 진행 중인 조회는 버리지 않고 캐시에 채우고,
  // 같은 좌표 조합이 이미 조회 중이면 다시 열어도 중복 요청하지 않는다.
  const latestKeyRef = useRef(positionsKey);
  latestKeyRef.current = positionsKey;
  const inFlightKeyRef = useRef(null);

  useEffect(() => {
    if (!isOpen || positions.length < 2) return;
    if (segmentData.key === positionsKey) return; // 같은 좌표 조합은 재조회하지 않음
    if (inFlightKeyRef.current === positionsKey) return; // 이미 조회 중

    const capturedKey = positionsKey;
    inFlightKeyRef.current = capturedKey;

    const baseUrl = import.meta.env.VITE_API_URL;
    const toRoutePoint = ({ lat, lng, placeId }) => ({
      lat,
      lng,
      ...(placeId ? { placeId } : {}),
    });
    const waypoints = positions.map(toRoutePoint);

    Promise.allSettled([
      post(`${baseUrl}/api/route/table`, { waypoints, profile: "driving" }),
      post(`${baseUrl}/api/route/table`, { waypoints, profile: "foot" }),
      ...positions.slice(0, -1).map((pos, i) =>
        post(`${baseUrl}/api/route/transit`, {
          from: toRoutePoint(pos),
          to: toRoutePoint(positions[i + 1]),
        })
      ),
    ]).then((results) => {
      if (inFlightKeyRef.current === capturedKey) {
        inFlightKeyRef.current = null;
      }
      if (latestKeyRef.current !== capturedKey) return; // 좌표가 바뀐 뒤 도착한 응답은 버림

      const [drivingResult, footResult, ...transitResults] = results;
      setSegmentData({
        key: capturedKey,
        driving: drivingResult.status === "fulfilled" ? drivingResult.value : null,
        foot: footResult.status === "fulfilled" ? footResult.value : null,
        transit: transitResults.map((result) =>
          result.status === "fulfilled" ? result.value : null
        ),
        hasError: results.every((result) => result.status === "rejected"),
      });
    });
  }, [isOpen, positions, positionsKey, post, segmentData.key]);

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          aria-label="구간 정보 펼치기"
          title="구간 정보 펼치기"
          className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900/95 px-4 py-2.5 text-sm font-bold text-white shadow-xl transition hover:bg-slate-800 md:bottom-auto md:left-4 md:top-4 md:translate-x-0"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white">
            <FontAwesomeIcon icon={faRoute} className="text-xs" />
          </span>
          구간 정보
          <FontAwesomeIcon icon={faChevronRight} className="hidden text-xs text-white/60 md:block" />
          <FontAwesomeIcon icon={faChevronUp} className="text-xs text-white/60 md:hidden" />
        </button>
      )}

      {isOpen && <aside
        aria-label="구간 정보"
        className={panelVariant === "edge"
          ? "absolute bottom-0 left-0 top-0 z-20 flex w-[min(400px,88vw)] flex-col border-r border-slate-200 bg-white/95 backdrop-blur-md"
          : "absolute bottom-0 left-0 right-0 z-20 flex max-h-[70%] flex-col rounded-t-3xl bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.18)] backdrop-blur-md md:bottom-4 md:left-4 md:right-auto md:top-4 md:max-h-none md:w-[clamp(340px,36%,400px)] md:rounded-3xl md:ring-1 md:ring-black/5 md:shadow-[0_12px_40px_rgba(15,23,42,0.18)]"}
      >
        {panelVariant !== "edge" && <div className="mx-auto mt-2 h-1 w-10 flex-none rounded-full bg-slate-200 md:hidden" />}
        <header className="flex flex-none items-center justify-between border-b border-slate-100 bg-white/90 px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-main text-white shadow-sm shadow-blue-200">
              <FontAwesomeIcon icon={faRoute} className="text-sm" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">구간별 이동</h2>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-main">
                  {Math.max(0, sortedSchedule.length - 1)}구간
                </span>
              </div>
              <p className="truncate text-xs text-slate-400">이동 수단별 시간과 경로를 비교해 보세요</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="구간 정보 접기"
            title="구간 정보 접기"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 md:hidden"
          >
            <FontAwesomeIcon icon={faChevronDown} />
          </button>
        </header>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="구간 정보 접기"
          title="구간 정보 접기"
          className={`absolute left-full top-1/2 z-30 hidden h-12 w-7 -translate-y-1/2 items-center justify-center rounded-r-xl bg-white text-slate-500 transition hover:text-main md:flex ${panelVariant === "edge" ? "border border-l-0 border-slate-200" : "shadow-[5px_1px_10px_rgba(15,23,42,0.14)]"}`}
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {!isLoading && segmentData.hasError ? (
            <div className="px-4 py-6 text-center text-sm leading-6 text-slate-500">
              구간 정보를 불러오지 못했어요.<br />
              잠시 후 다시 시도해 주세요.
            </div>
          ) : (
            <div className="px-5 py-5">
              {sortedSchedule.map((item, i) => {
                const next = sortedSchedule[i + 1];
                const transit = segmentData.transit?.[i];

                return (
                  <div key={item.id} className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-3">
                    <div className="relative flex justify-center">
                      {next && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-0 top-7 w-px bg-blue-200"
                        />
                      )}
                      <NumberBadge number={i + 1} />
                    </div>

                    <div className={next ? "pb-7" : "pb-1"}>
                      <div className="flex h-7 min-w-0 items-center">
                        <span className="truncate text-[15px] font-bold text-slate-900">
                          {item.place.name}
                        </span>
                      </div>

                      {next && (
                        <div className="mt-4 grid grid-cols-2 gap-2" aria-label={`${item.place.name}에서 ${next.place.name}까지 이동 정보`}>
                          <SegmentRow
                            icon={faCar}
                            label="차량"
                            tone="blue"
                            isLoading={isLoading}
                            value={joinParts(
                              formatSeconds(segmentData.driving?.durations?.[i]?.[i + 1]),
                              formatMeters(segmentData.driving?.distances?.[i]?.[i + 1])
                            )}
                          />
                          <SegmentRow
                            icon={faPersonWalking}
                            label="도보"
                            tone="gray"
                            isLoading={isLoading}
                            value={joinParts(
                              formatSeconds(segmentData.foot?.durations?.[i]?.[i + 1]),
                              formatMeters(segmentData.foot?.distances?.[i]?.[i + 1])
                            )}
                          />
                          <div className="col-span-2">
                            <TransitInfo
                              transit={transit}
                              isLoading={isLoading}
                              segmentIndex={i}
                              onShowTransitRoute={onShowTransitRoute}
                              activeTransitKey={activeTransitKey}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>}
    </>
  );
}
