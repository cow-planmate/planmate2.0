import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCar,
  faBus,
  faPersonWalking,
  faRoute,
  faTrainSubway,
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

// 지금 출발한다고 보고 도착 예정 시각을 만든다 → "오후 1:11 도착"
const formatArrival = (minutes) => {
  if (minutes == null || Number.isNaN(minutes)) return null;
  const at = new Date(Date.now() + minutes * 60000);
  const hour = at.getHours();
  return `${hour < 12 ? "오전" : "오후"} ${hour % 12 || 12}:${String(at.getMinutes()).padStart(2, "0")} 도착`;
};

// null인 항목을 제외하고 " · "로 연결. 전부 null이면 null
const joinParts = (...parts) => {
  const filtered = parts.filter(Boolean);
  return filtered.length > 0 ? filtered.join(" · ") : null;
};

// 소요 시간 표기. 숫자만 크게 두고 "시간"/"분" 단위는 작게 붙인다.
const BigDuration = ({ minutes }) => {
  const text = formatMinutes(minutes);
  if (!text) return null;

  return (
    <span className="text-slate-900">
      {text.split(/(\d+)/).filter(Boolean).map((part, i) =>
        /^\d+$/.test(part) ? (
          <span key={i} className="text-[22px] font-extrabold leading-none tracking-tight">{part}</span>
        ) : (
          <span key={i} className="text-[15px] font-bold leading-none">{part}</span>
        )
      )}
    </span>
  );
};

// 이동 수단 요약 한 줄. 소요 시간을 가장 크게 두고 요금·거리는 보조 문구로 붙인다.
// onSelect가 있으면 눌러서 지도에 경로를 그릴 수 있는 버튼이 된다.
const SegmentRow = ({ label, primary, secondary, isLoading, title, onSelect, isActive }) => {
  if (isLoading) {
    return (
      <div className="px-4 py-3.5">
        <span
          className="block h-5 w-24 animate-pulse rounded bg-slate-100"
          aria-label={`${label} 정보 불러오는 중`}
        />
      </div>
    );
  }

  const body = (
    <>
      <span className="sr-only">{label}</span>
      <span className="min-w-0 truncate">
        {primary ? (
          <span className="text-[17px] font-bold leading-6 tracking-tight text-slate-900">{primary}</span>
        ) : (
          <span className="text-[13px] font-medium text-slate-400">정보 없음</span>
        )}
        {primary && secondary && (
          <span className="ml-1.5 text-[13px] font-medium text-slate-500">{secondary}</span>
        )}
      </span>
      {onSelect && primary && (
        <span className={`flex-none text-[11px] font-bold ${isActive ? "text-main" : "text-slate-400"}`}>
          {isActive ? "지도 표시 중" : "지도에서 보기"}
        </span>
      )}
    </>
  );

  const className = "flex w-full min-w-0 items-center justify-between gap-3 px-4 py-3.5 text-left";

  if (!onSelect || primary == null) {
    return <div className={className} title={title}>{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={!!isActive}
      title={title ?? `${label} 경로를 지도에서 보기`}
      className={`${className} transition ${isActive ? "bg-blue-50/70" : "hover:bg-slate-50"}`}
    >
      {body}
    </button>
  );
};

const NumberBadge = ({ number }) => (
  <span className="relative z-10 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-main text-[11px] font-bold text-white ring-4 ring-white">
    {number}
  </span>
);

// 스텝의 색상(버스/지하철/도보)을 구한다.
const stepColor = (step) => {
  if (step.trafficType === 2) return BUS_COLOR;
  if (step.trafficType === 1) return SUBWAY_COLORS[step.subwayCode] || DEFAULT_SUBWAY_COLOR;
  return null; // 도보는 Tailwind bg-slate-300 사용
};

// 경로 하나의 비율 막대. 폭 ∝ sectionTime, 칸 안에 해당 구간 소요 시간을 적는다.
// 도보는 회색 트랙 위 회색 글씨, 버스/지하철은 노선색 캡슐 + 흰 글씨.
const RouteBar = ({ steps }) => (
  <div className="flex h-6 items-center gap-0.5 overflow-hidden rounded-full bg-slate-100 px-0.5">
    {steps.map((step, i) => {
      const isWalk = step.trafficType === 3;
      const minutes = Math.max(1, Math.round(step.sectionTime || 1));
      const icon =
        isWalk ? faPersonWalking : step.trafficType === 2 ? faBus : faTrainSubway;
      return (
        <div
          key={i}
          style={{ flexGrow: step.sectionTime || 1, backgroundColor: isWalk ? undefined : stepColor(step) }}
          className={`flex h-5 min-w-[20px] items-center justify-center gap-1 overflow-hidden rounded-full px-1.5 ${
            isWalk ? "text-slate-500" : "text-white"
          }`}
        >
          <FontAwesomeIcon icon={icon} className="flex-none text-[9px]" />
          <span className="truncate text-[10px] font-bold leading-none">{minutes}분</span>
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
    <div className="mt-1">
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

// 경로 하나의 대중교통 스텝 행. 왼쪽에 노선, 오른쪽에 승차역과 부가 정보를 둔다.
// 도보 구간은 위 막대에 소요 시간이 이미 나오므로 목록에서는 생략한다.
const RouteStepRow = ({ step }) => {
  if (step.trafficType !== 1 && step.trafficType !== 2) return null;

  const isBus = step.trafficType === 2;
  const color = stepColor(step) ?? DEFAULT_SUBWAY_COLOR;
  const lane = step.laneName || (isBus ? "버스" : "지하철");
  const station = isBus ? step.startName : step.startName ? `${step.startName}역` : null;
  const sub = joinParts(
    isBus ? BUS_TYPE_LABELS[step.busType] ?? null : step.startExitNo ? `${step.startExitNo}번 출구` : null,
    step.endName ? `${isBus ? step.endName : `${step.endName}역`} 방면` : null,
    step.intervalTime != null ? `배차 ${step.intervalTime}분` : null
  );

  return (
    <div className="grid grid-cols-[84px_minmax(0,1fr)] items-start gap-3 py-1.5">
      <div className="flex min-w-0 items-center gap-1.5">
        <FontAwesomeIcon
          icon={isBus ? faBus : faTrainSubway}
          style={{ color }}
          className="flex-none text-[11px]"
        />
        <span style={{ color }} className="truncate text-[13px] font-bold">{lane}</span>
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-bold text-slate-900">{station ?? "-"}</div>
        {sub && <div className="mt-0.5 truncate text-[11px] text-slate-400">{sub}</div>}
        <PassStopsToggle passStops={step.passStops} />
      </div>
    </div>
  );
};

// 차량/도보 경로 한 개의 턴바이턴 안내 토글. 대안 경로에는 안내가 없어 렌더하지 않는다.
const RouteStepsToggle = ({ steps }) => {
  const [open, setOpen] = useState(false);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-[11px] font-medium text-slate-400 transition hover:text-slate-600"
      >
        안내 {steps.length}단계
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="text-[9px]" />
      </button>
      {open && (
        <ol className="mt-1.5 space-y-1.5 border-l border-dashed border-slate-200 pl-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-baseline justify-between gap-2 text-xs text-slate-600">
              <span className="min-w-0">{step.instruction ?? step.name ?? "계속 이동"}</span>
              {step.distance > 0 && (
                <span className="flex-none text-[11px] text-slate-400">{formatMeters(step.distance)}</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

// 차량/도보의 경로 후보 목록. 첫 번째가 추천 경로, 나머지는 대안 경로.
const RoadRoutes = ({ profile, routes, selectedIndex, isLoading, onSelectRoute }) => {
  if (isLoading) {
    return (
      <div className="pt-1">
        <div className="h-20 animate-pulse rounded-xl bg-slate-100" aria-label="경로 불러오는 중" />
      </div>
    );
  }

  if (!routes || routes.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-slate-400">
        경로를 불러오지 못했어요.
      </div>
    );
  }

  const label = profile === "foot" ? "도보" : "차량";

  return (
    <div className="pt-1">
      <div className="mb-2 text-[11px] font-bold tracking-wide text-slate-400">{label} 경로 {routes.length}개</div>

      {routes.map((route, ri) => {
        const isSelected = selectedIndex === ri;

        return (
          <div
            key={ri}
            className={`mb-2 rounded-xl border bg-white p-3.5 transition ${
              isSelected ? "border-main/40 bg-blue-50/40" : "border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  {formatSeconds(route.duration)}
                </span>
                <span className="ml-1.5 text-xs font-medium text-slate-500">
                  {formatMeters(route.distance)}
                </span>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                ri === 0 ? "bg-blue-50 text-main" : "text-slate-400"
              }`}>
                {ri === 0 ? "추천" : `대안 ${ri}`}
              </span>
            </div>

            <RouteStepsToggle steps={route.steps} />

            <button
              type="button"
              onClick={() => onSelectRoute(ri)}
              className={`mt-3 w-full rounded-lg border py-2 text-xs font-bold transition ${
                isSelected
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-main hover:text-main"
              }`}
            >
              {isSelected ? "지도에 표시 중" : "지도에 보기"}
            </button>
          </div>
        );
      })}
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

  const filtered = (selected === "전체" ? routes : routes.filter((r) => r.pathType === selected))
    .slice()
    .sort((a, b) => (a.totalTime ?? Infinity) - (b.totalTime ?? Infinity));

  // 네이버 지도처럼 대표 경로에 라벨을 붙인다. 같은 값이면 앞선 경로가 가져간다.
  const transfersOf = (r) => (r.busTransitCount ?? 0) + (r.subwayTransitCount ?? 0);
  const pickIndex = (score) =>
    filtered.reduce((best, r, i) => (score(r) < score(filtered[best]) ? i : best), 0);
  const fewestTransferIndex = filtered.length > 0 ? pickIndex(transfersOf) : -1;
  const shortestWalkIndex = filtered.length > 0 ? pickIndex((r) => r.totalWalk ?? Infinity) : -1;

  const labelOf = (i) => {
    if (i === 0) return "최적"; // 정렬했으므로 첫 번째가 최단 시간
    if (i === fewestTransferIndex) return "환승 적음";
    if (i === shortestWalkIndex) return "도보 적음";
    return null;
  };

  return (
    <div className="border-t border-slate-100 px-4 pt-3">
      <div className="mb-1 flex gap-1.5 overflow-x-auto pb-1">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => setSelected(chip.key)}
            className={`flex-none rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              selected === chip.key
                ? "border-main bg-blue-50 text-main"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {filtered.map((route, ri) => {
        const transferCount = transfersOf(route);
        const subtitle = joinParts(
          transferCount > 0 ? `환승 ${transferCount}회` : null,
          route.totalWalk ? `도보 ${formatMeters(route.totalWalk)}` : null
        );
        const label = labelOf(ri);
        const laneKey = `${segmentIndex}-${ri}`;
        const laneActive = activeTransitKey === laneKey;

        return (
          <div
            key={ri}
            className={`-mx-4 border-t border-slate-100 px-4 py-4 transition first:border-t-0 ${
              laneActive ? "bg-blue-50/60" : "hover:bg-slate-50/70"
            }`}
          >
            {(label || subtitle) && (
              <div className="mb-1 flex items-baseline justify-between gap-2">
                {label && <span className="text-[13px] font-bold text-main">{label}</span>}
                {subtitle && (
                  <span className="ml-auto text-[11px] font-medium text-slate-400">{subtitle}</span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <BigDuration minutes={route.totalTime} />
              {formatArrival(route.totalTime) && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-[13px] font-medium text-slate-500">
                    {formatArrival(route.totalTime)}
                  </span>
                </>
              )}
              {formatPayment(route.payment) && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-[13px] font-medium text-slate-500">
                    {formatPayment(route.payment)}
                  </span>
                </>
              )}
            </div>

            <div className="mt-3">
              <RouteBar steps={route.steps} />
            </div>

            <div className="mt-3">
              {route.steps.map((step, si) => <RouteStepRow key={si} step={step} />)}

              {route.lastEndStation && (
                <div className="grid grid-cols-[84px_minmax(0,1fr)] items-center gap-3 py-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="h-2.5 w-2.5 flex-none rounded-full border-2 border-slate-300" />
                    <span className="text-[13px] font-bold">하차</span>
                  </div>
                  <span className="truncate text-sm font-bold text-slate-900">
                    {route.lastEndStation}
                  </span>
                </div>
              )}
            </div>

            {onShowTransitRoute && route.mapObj && (
              <button
                type="button"
                onClick={() => onShowTransitRoute(route.mapObj, laneKey, segmentIndex)}
                className="mt-2 flex items-center gap-1 text-xs font-bold text-slate-500 transition hover:text-main"
              >
                {laneActive ? "지도에서 숨기기" : "지도에서 보기"}
                <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
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
  // 목록이 소요 시간 순이므로 요약도 가장 빠른 경로로 맞춘다 (ODsay 응답 순서는 시간순이 아니다)
  const best = available
    ? transit.routes.reduce((a, b) => ((b.totalTime ?? Infinity) < (a.totalTime ?? Infinity) ? b : a))
    : null;
  const transferCount = best
    ? (best.busTransitCount ?? 0) + (best.subwayTransitCount ?? 0)
    : 0;

  return (
    <div>
      <SegmentRow
        label="대중교통"
        isLoading={isLoading}
        title={!available ? transit?.message ?? undefined : undefined}
        primary={available ? formatMinutes(best.totalTime) : null}
        secondary={
          available
            ? joinParts(
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
            className="flex w-full items-center justify-center gap-1 border-t border-slate-100 py-2.5 text-[11px] font-bold text-slate-500 transition hover:bg-slate-50 hover:text-main"
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
  onShowRoadRoute,
  onSelectRoadRoute,
  roadRoute,
  isOpen,
  onOpenChange,
  panelVariant = "floating",
  activeSegmentIndex,
  onFocusSegment,
}) {
  const { post } = useApiClient();
  const [segmentModes, setSegmentModes] = useState({});

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
        <header className="flex flex-none items-center justify-between gap-3 border-b border-slate-100 bg-white/90 px-4 py-3.5">
          <div className="flex min-w-0 items-baseline gap-2">
            <h2 className="text-[15px] font-bold tracking-tight text-slate-900">구간별 이동</h2>
            <span className="flex-none text-xs font-medium text-slate-400">
              {Math.max(0, sortedSchedule.length - 1)}구간
            </span>
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
            <div className="px-4 py-4">
              {sortedSchedule.map((item, i) => {
                const next = sortedSchedule[i + 1];
                const transit = segmentData.transit?.[i];
                const activeMode = segmentModes[i] ?? "transit";

                return (
                  <div key={item.id} className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-x-3">
                    <div className="relative flex justify-center">
                      {next && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-0 top-0 w-px bg-slate-200"
                        />
                      )}
                      <NumberBadge number={i + 1} />
                    </div>

                    <div className={next ? "pb-6" : "pb-1"}>
                      <div className="flex h-6 min-w-0 items-center">
                        <span className="truncate text-[15px] font-bold leading-6 tracking-tight text-slate-900">
                          {item.place.name}
                        </span>
                      </div>

                      {next && (
                        <div className="mt-2.5">
                          <div className="mb-1.5 flex items-center justify-between gap-2 pl-0.5">
                            <span className="text-[11px] font-bold tracking-wide text-slate-400">
                              {i + 1} → {i + 2} 구간
                            </span>
                            <button
                              type="button"
                              onClick={() => onFocusSegment?.(i)}
                              aria-pressed={activeSegmentIndex === i}
                              className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold transition ${
                                activeSegmentIndex === i
                                  ? "bg-blue-50 text-main"
                                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              }`}
                            >
                              {activeSegmentIndex === i ? "지도에 표시 중" : "지도에서 보기"}
                            </button>
                          </div>
                          <div
                            className="overflow-hidden rounded-xl border border-slate-200/80 bg-white"
                            aria-label={`${item.place.name}에서 ${next.place.name}까지 이동 정보`}
                          >
                            <div className="flex border-b border-slate-100 px-1" role="tablist" aria-label={`${i + 1}구간 이동 수단 선택`}>
                              {[
                                { key: "transit", label: "대중교통", icon: faBus },
                                { key: "driving", label: "자동차", icon: faCar },
                                { key: "foot", label: "도보", icon: faPersonWalking },
                              ].map((mode) => {
                                const selected = activeMode === mode.key;
                                return (
                                  <button
                                    key={mode.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={selected}
                                    onClick={() => setSegmentModes((current) => ({ ...current, [i]: mode.key }))}
                                    className={`relative flex min-w-0 flex-1 items-center justify-center gap-1.5 px-1 py-2.5 text-[13px] transition ${
                                      selected
                                        ? "font-bold text-slate-900"
                                        : "font-medium text-slate-400 hover:text-slate-600"
                                    }`}
                                  >
                                    <FontAwesomeIcon icon={mode.icon} className="text-[11px]" />
                                    <span className="truncate">{mode.label}</span>
                                    {selected && (
                                      <span aria-hidden="true" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-main" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            {activeMode !== "transit" && <div>
                              <SegmentRow
                                label={activeMode === "driving" ? "자동차" : "도보"}
                                isLoading={isLoading}
                                onSelect={onShowRoadRoute ? () => onShowRoadRoute(activeMode, i) : undefined}
                                isActive={roadRoute?.key === `${i}-${activeMode}`}
                                primary={formatSeconds(segmentData[activeMode]?.durations?.[i]?.[i + 1])}
                                secondary={formatMeters(segmentData[activeMode]?.distances?.[i]?.[i + 1])}
                              />
                            </div>}
                            {activeMode !== "transit" && roadRoute?.segmentIndex === i && roadRoute.profile === activeMode && (
                              <div className="border-t border-slate-100 px-4 pb-3.5 pt-3">
                                <RoadRoutes
                                  profile={roadRoute.profile}
                                  routes={roadRoute.routes}
                                  selectedIndex={roadRoute.selectedIndex}
                                  isLoading={roadRoute.isLoading}
                                  onSelectRoute={onSelectRoadRoute}
                                />
                              </div>
                            )}
                            {activeMode === "transit" && <div>
                              <TransitInfo
                                transit={transit}
                                isLoading={isLoading}
                                segmentIndex={i}
                                onShowTransitRoute={onShowTransitRoute}
                                activeTransitKey={activeTransitKey}
                              />
                            </div>}
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
