import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCar,
  faBus,
  faPersonWalking,
  faRoute,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { useApiClient } from "../../hooks/useApiClient";

// 버스 종류 코드 → 표기 라벨 (알 수 없으면 null)
const BUS_TYPE_LABELS = {
  1: "일반",
  2: "좌석",
  3: "마을",
  4: "직행",
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

const SegmentRow = ({ icon, label, value, isLoading, title }) => (
  <div className="flex items-center gap-2 text-sm" title={title}>
    <FontAwesomeIcon icon={icon} className="w-4 flex-none text-main" />
    <span className="w-14 flex-none text-slate-500">{label}</span>
    {isLoading ? (
      <span className="text-slate-400">불러오는 중…</span>
    ) : (
      <span className="font-medium text-slate-700">{value ?? "—"}</span>
    )}
  </div>
);

const NumberBadge = ({ number }) => (
  <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full border border-main text-sm font-semibold text-main">
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
  <div className="mb-2 flex h-5 overflow-hidden rounded-full">
    {steps.map((step, i) => {
      const isWalk = step.trafficType === 3;
      const color = stepColor(step);
      return (
        <div
          key={i}
          style={{ flexGrow: step.sectionTime || 1, backgroundColor: color ?? undefined }}
          className={`flex min-w-[10px] items-center justify-center gap-0.5 overflow-hidden ${
            isWalk ? "bg-slate-300" : ""
          }`}
        >
          {isWalk && (
            <FontAwesomeIcon icon={faPersonWalking} className="text-[9px] text-slate-500" />
          )}
          {step.sectionTime != null && (
            <span
              className={`truncate px-0.5 text-[10px] ${
                isWalk ? "text-slate-500" : "text-white"
              }`}
            >
              {step.sectionTime}분
            </span>
          )}
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
    <div className="pl-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-[11px] text-slate-400 hover:underline"
      >
        경유 정류장 {passStops.length}개
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="text-[9px]" />
      </button>
      {open && (
        <ul className="mt-0.5 space-y-0.5 pl-3">
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
      <div className="flex flex-wrap items-center gap-1 text-xs text-slate-600">
        <span className="rounded bg-green-50 px-1.5 text-green-700">
          {BUS_TYPE_LABELS[step.busType] || "버스"}
        </span>
        {step.startName && <span>{step.startName}</span>}
        {step.laneName && (
          <span className="rounded border border-slate-300 px-1 font-semibold">
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
      <div className="flex flex-wrap items-center gap-1 text-xs text-slate-600">
        <span
          style={{ backgroundColor: color }}
          className="rounded px-1.5 font-semibold text-white"
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
    <div className="space-y-0.5">
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
    <div className="mt-2">
      <div className="mb-2 flex flex-wrap gap-1">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => setSelected(chip.key)}
            className={`rounded-full px-3 py-1 text-xs ${
              selected === chip.key
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-600"
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
          <div key={ri} className="mb-2 rounded-xl border border-slate-200 p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-slate-800">{route.totalTime}분</span>
              <span className="text-sm font-semibold text-slate-700">
                {route.payment?.toLocaleString()}원
              </span>
            </div>
            {subtitle && <div className="mb-2 text-xs text-slate-400">{subtitle}</div>}

            <RouteBar steps={route.steps} />

            <div className="space-y-1">
              {route.steps.map((step, si) =>
                step.trafficType === 3 ? null : <RouteDetailRow key={si} step={step} />
              )}
            </div>

            {route.lastEndStation && (
              <div className="mt-1.5 text-xs text-slate-400">○ 하차 {route.lastEndStation}</div>
            )}

            {onShowTransitRoute && route.mapObj && (
              <button
                type="button"
                onClick={() => onShowTransitRoute(route.mapObj, laneKey)}
                className={`mt-2 w-full rounded-lg py-1.5 text-xs font-semibold transition ${
                  laneActive
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
            className="mt-1 flex items-center gap-1 pl-6 text-xs font-medium text-main hover:underline"
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
}) {
  const { post } = useApiClient();

  const [isOpen, setIsOpen] = useState(false);
  const [segmentData, setSegmentData] = useState({
    key: null,
    driving: null,
    foot: null,
    transit: [],
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
    const waypoints = positions.map((pos) => ({ lat: pos.lat, lng: pos.lng }));

    Promise.allSettled([
      post(`${baseUrl}/api/route/table`, { waypoints, profile: "driving" }),
      post(`${baseUrl}/api/route/table`, { waypoints, profile: "foot" }),
      ...positions.slice(0, -1).map((pos, i) =>
        post(`${baseUrl}/api/route/transit`, {
          from: { lat: pos.lat, lng: pos.lng },
          to: { lat: positions[i + 1].lat, lng: positions[i + 1].lng },
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
      });
    });
  }, [isOpen, positionsKey]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg ring-1 ring-slate-200 transition hover:bg-white"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-main/10 text-main">
          <FontAwesomeIcon icon={faRoute} className="text-xs" />
        </span>
        구간 정보
      </button>

      {isOpen && (
        <div className="absolute left-4 top-16 z-10 max-h-[60%] w-[320px] overflow-y-auto rounded-2xl bg-white/95 shadow-lg ring-1 ring-slate-200">
          {sortedSchedule.slice(0, -1).map((item, i) => {
            const next = sortedSchedule[i + 1];
            const transit = segmentData.transit?.[i];

            return (
              <div
                key={`${item.id}-${next.id}`}
                className="border-b border-slate-100 px-4 py-3 last:border-b-0"
              >
                <div className="mb-2 flex items-center gap-1.5">
                  <NumberBadge number={i + 1} />
                  <span className="min-w-0 truncate text-sm font-semibold text-slate-800">
                    {item.place.name}
                  </span>
                  <span className="flex-none text-sm text-slate-400">→</span>
                  <NumberBadge number={i + 2} />
                  <span className="min-w-0 truncate text-sm font-semibold text-slate-800">
                    {next.place.name}
                  </span>
                </div>

                <div className="space-y-1">
                  <SegmentRow
                    icon={faCar}
                    label="차량"
                    isLoading={isLoading}
                    value={joinParts(
                      formatSeconds(segmentData.driving?.durations?.[i]?.[i + 1]),
                      formatMeters(segmentData.driving?.distances?.[i]?.[i + 1])
                    )}
                  />
                  <SegmentRow
                    icon={faPersonWalking}
                    label="도보"
                    isLoading={isLoading}
                    value={joinParts(
                      formatSeconds(segmentData.foot?.durations?.[i]?.[i + 1]),
                      formatMeters(segmentData.foot?.distances?.[i]?.[i + 1])
                    )}
                  />
                  <TransitInfo
                    transit={transit}
                    isLoading={isLoading}
                    segmentIndex={i}
                    onShowTransitRoute={onShowTransitRoute}
                    activeTransitKey={activeTransitKey}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
