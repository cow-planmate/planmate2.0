import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { CustomOverlayMap, Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import { LocateFixed, RotateCcw, Route } from "lucide-react";
import useKakaoLoader from "../../hooks/useKakaoLoader";
import { useApiClient } from "../../hooks/useApiClient";
import SegmentInfoPanel, { SUBWAY_COLORS, BUS_COLOR } from "./SegmentInfoPanel";

const isValidPosition = (place) =>
  (place?.yLocation != null || place?.ylocation != null) &&
  (place?.xLocation != null || place?.xlocation != null);

const distanceSquared = (a, b) =>
  ((a.lat - b.lat) ** 2) + ((a.lng - b.lng) ** 2);

// 하나로 전달된 전체 도로 경로를 일정 장소 기준의 구간들로 나눈다.
const splitPathByWaypoints = (path, waypoints) => {
  if (path.length < 2 || waypoints.length < 2) return [];

  const boundaries = [0];
  let searchFrom = 0;
  waypoints.slice(1, -1).forEach((waypoint) => {
    let nearestIndex = searchFrom;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (let i = searchFrom; i < path.length; i += 1) {
      const nextDistance = distanceSquared(path[i], waypoint);
      if (nextDistance < nearestDistance) {
        nearestDistance = nextDistance;
        nearestIndex = i;
      }
    }
    boundaries.push(nearestIndex);
    searchFrom = nearestIndex;
  });
  boundaries.push(path.length - 1);

  return boundaries.slice(0, -1).map((start, index) => {
    const end = boundaries[index + 1];
    return path.slice(start, Math.max(start + 2, end + 1));
  });
};

export default function MapComponent({
  schedule,
  defaultSegmentInfoOpen = true,
  onSegmentInfoRequest,
  segmentPanelVariant = "floating",
}) {
  useKakaoLoader()
  const { post } = useApiClient();

  const [map, setMap] = useState();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [routePath, setRoutePath] = useState([]);
  const [transitLanes, setTransitLanes] = useState([]); // [{ color, path, isWalk }]
  const [activeTransitKey, setActiveTransitKey] = useState(null);
  // 선택한 구간의 차량/도보 실제 경로. { key, profile, path }
  const [activeRoadRoute, setActiveRoadRoute] = useState(null);
  const [isSegmentInfoOpen, setIsSegmentInfoOpen] = useState(defaultSegmentInfoOpen);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(null);

  const handleSegmentInfoOpenChange = (nextOpen) => {
    if (nextOpen && onSegmentInfoRequest) {
      onSegmentInfoRequest();
      return;
    }
    setIsSegmentInfoOpen(nextOpen);
  };

  // 구간+수단별 경로 목록 캐시. 같은 칸을 다시 눌러도 재요청하지 않는다.
  // (Map 식별자는 react-kakao-maps-sdk의 지도 컴포넌트가 차지하고 있어 평범한 객체를 쓴다)
  const roadRouteCacheRef = useRef({});

  // 선택한 구간의 차량/도보 경로 후보를 받아온다. 같은 칸을 다시 누르면 접는다.
  const showRoadRoute = async (profile, segmentIndex) => {
    const key = `${segmentIndex}-${profile}`;
    if (key === activeRoadRoute?.key) {
      setActiveRoadRoute(null);
      setActiveSegmentIndex(null);
      return;
    }

    const from = positions[segmentIndex];
    const to = positions[segmentIndex + 1];
    if (!from || !to) return;

    // 대중교통 폴리라인과는 동시에 표시하지 않는다
    setTransitLanes([]);
    setActiveTransitKey(null);
    setActiveSegmentIndex(segmentIndex);

    const cached = roadRouteCacheRef.current[key];
    if (cached) {
      setActiveRoadRoute({ key, profile, segmentIndex, routes: cached, selectedIndex: 0, isLoading: false });
      return;
    }

    setActiveRoadRoute({ key, profile, segmentIndex, routes: [], selectedIndex: 0, isLoading: true });

    const toPoint = ({ lat, lng, placeId }) => ({ lat, lng, ...(placeId ? { placeId } : {}) });
    try {
      const res = await post(`${import.meta.env.VITE_API_URL}/api/route/directions`, {
        waypoints: [toPoint(from), toPoint(to)],
        profile,
      });

      // 백엔드는 경로 탐색 실패 시 입력 좌표를 그대로(거리/시간 0) 돌려준다
      const isFallback = !res || (res.distance === 0 && res.duration === 0);
      const leg = res?.legs?.[0];
      const mainPath = isFallback ? [] : (res?.path ?? []);

      // 첫 번째가 추천 경로, 나머지는 대안 경로(대안에는 턴바이턴 안내가 없다)
      const routes = mainPath.length >= 2
        ? [
            {
              path: mainPath,
              distance: res.distance,
              duration: res.duration,
              steps: leg?.steps ?? [],
            },
            ...(leg?.alternatives ?? [])
              .filter((alt) => (alt.path?.length ?? 0) >= 2)
              .map((alt) => ({
                path: alt.path,
                distance: alt.distance,
                duration: alt.duration,
                steps: [],
              })),
          ]
        : [];

      roadRouteCacheRef.current[key] = routes;
      // 응답이 오는 사이 다른 칸을 눌렀다면 그쪽 선택을 덮어쓰지 않는다
      setActiveRoadRoute((current) =>
        current?.key === key ? { ...current, routes, isLoading: false } : current
      );
    } catch {
      setActiveRoadRoute((current) =>
        current?.key === key ? { ...current, routes: [], isLoading: false } : current
      );
    }
  };

  // 펼친 목록에서 다른 경로 후보를 고른다.
  const selectRoadRoute = (index) => {
    setActiveRoadRoute((current) => (current ? { ...current, selectedIndex: index } : current));
  };

  // 선택한 대중교통 경로(mapObj)의 폴리라인을 지도에 그린다. 같은 카드를 다시 누르면 지운다.
  const showTransitRoute = async (mapObj, key, segmentIndex) => {
    if (key === activeTransitKey) {
      setTransitLanes([]);
      setActiveTransitKey(null);
      setActiveSegmentIndex(null);
      return;
    }
    try {
      const res = await post(`${import.meta.env.VITE_API_URL}/api/route/transit/lane`, { mapObj });
      const transitOnlyLanes = (res?.lanes ?? []).map((lane) => ({
        color:
          lane.trafficClass === 1
            ? BUS_COLOR
            : SUBWAY_COLORS[lane.type] || "#3B82F6",
        path: (lane.path ?? []).map((p) => ({ lat: p.lat, lng: p.lng })),
        isWalk: false,
      })).filter((lane) => lane.path.length >= 2);

      // 출발지→승차 지점, 환승 사이, 하차 지점→도착지의 도보 경로도 함께 구한다.
      const from = positions[segmentIndex];
      const to = positions[segmentIndex + 1];
      const walkPairs = [];
      if (from && transitOnlyLanes[0]) walkPairs.push([from, transitOnlyLanes[0].path[0]]);
      transitOnlyLanes.slice(0, -1).forEach((lane, index) => {
        walkPairs.push([lane.path[lane.path.length - 1], transitOnlyLanes[index + 1].path[0]]);
      });
      if (to && transitOnlyLanes.length) {
        const lastPath = transitOnlyLanes[transitOnlyLanes.length - 1].path;
        walkPairs.push([lastPath[lastPath.length - 1], to]);
      }

      const meaningfulWalkPairs = walkPairs.filter(([start, end]) => distanceSquared(start, end) > 0.00000002);
      const walkResults = await Promise.all(meaningfulWalkPairs.map(async ([start, end]) => {
        try {
          const walk = await post(`${import.meta.env.VITE_API_URL}/api/route/directions`, {
            waypoints: [
              { lat: start.lat, lng: start.lng },
              { lat: end.lat, lng: end.lng },
            ],
            profile: "foot",
          });
          return (walk?.path?.length ?? 0) >= 2 ? walk.path : [start, end];
        } catch {
          return [start, end];
        }
      }));

      const walkLanes = walkResults.map((path) => ({ color: "#64748B", path, isWalk: true }));
      setTransitLanes([...walkLanes, ...transitOnlyLanes]);
      setActiveRoadRoute(null);
      setActiveTransitKey(key);
      setActiveSegmentIndex(Number.parseInt(key.split("-")[0], 10));
    } catch {
      // 폴리라인 조회 실패 시 조용히 무시(기존 지도 상태 유지)
    }
  };

  const sortedSchedule = useMemo(
    () => [...schedule]
      .sort((a, b) => a.start - b.start)
      .filter((item) => isValidPosition(item.place)),
    [schedule],
  );

  const positions = useMemo(() => sortedSchedule
    .map((item, index) => {
      const rawPlaceId = item.place?.placeId;
      const placeId = rawPlaceId == null ? "" : String(rawPlaceId).trim();
      const isCustomPlace = placeId.startsWith("custom-") || placeId.startsWith("custom_");

      return {
        index, // ← 원래 순서 번호 유지용
        lat: isValidPosition(item.place) ? (item.place.yLocation ?? item.place.ylocation) : null,
        lng: isValidPosition(item.place) ? (item.place.xLocation ?? item.place.xlocation) : null,
        ...(placeId && !isCustomPlace ? { placeId } : {}),
      };
    })
    .filter(pos => pos.lat != null && pos.lng != null), [sortedSchedule]);

  const positionsKey = positions
    .map((pos) => `${pos.lat},${pos.lng}`)
    .join("|");

  const routeSegments = useMemo(() => {
    if (routePath.length > 0) return splitPathByWaypoints(routePath, positions);
    return positions.slice(0, -1).map((position, index) => [position, positions[index + 1]]);
  }, [routePath, positions]);

  const resetMapFocus = () => {
    setActiveSegmentIndex(null);
    setTransitLanes([]);
    setActiveTransitKey(null);
    setActiveRoadRoute(null);
  };

  const focusSegment = (index) => {
    setActiveSegmentIndex((current) => current === index ? null : index);
  };

  // useEffect를 사용하여 map 인스턴스가 생성된 후 한 번만 실행되도록 설정
  useEffect(() => {
    if (!map || positions.length === 0) return; // map 인스턴스가 아직 생성되지 않았다면 아무것도 하지 않음

    // LatLngBounds 객체에 모든 마커의 좌표를 추가합니다.
    const bounds = new window.kakao.maps.LatLngBounds();
    positions.forEach((pos) => {
      bounds.extend(new window.kakao.maps.LatLng(pos.lat, pos.lng));
    });

    // 패널 상태가 바뀌면 실제로 보이는 지도 영역 안에 마커를 맞춥니다.
    const fitMapToPositions = () => {
      map.relayout();
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const leftPadding = isSegmentInfoOpen && isDesktop ? 400 : 48;
      const bottomPadding = isSegmentInfoOpen && !isDesktop ? 280 : 48;
      map.setBounds(bounds, 48, 48, bottomPadding, leftPadding);
    };

    const frameId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(fitMapToPositions);
    });
    const fitTimer = window.setTimeout(fitMapToPositions, 180);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(fitTimer);
    };
  }, [map, positions, isSegmentInfoOpen]);

  // 도로를 따라가는 실제 경로를 백엔드(OSRM 길찾기)에서 받아온다.
  // 실패 시 routePath는 빈 배열로 남아 직선(positions)으로 대체된다.
  useEffect(() => {
    setRoutePath([]); // 좌표가 바뀌면 이전 경로 잔상을 지운다
    roadRouteCacheRef.current = {};
    setActiveRoadRoute(null);

    if (positions.length < 2) {
      return;
    }

    let cancelled = false;

    post(`${import.meta.env.VITE_API_URL}/api/route/directions`, {
      waypoints: positions.map(({ lat, lng, placeId }) => ({
        lat,
        lng,
        ...(placeId ? { placeId } : {}),
      })),
    })
      .then((res) => {
        // 백엔드는 경로 탐색 실패 시 입력 좌표를 그대로(거리/시간 0) 돌려준다 → 직선 폴백 유지
        const isFallback = !res || (res.distance === 0 && res.duration === 0);
        if (!cancelled && !isFallback && res?.path?.length > 0) {
          setRoutePath(res.path);
        }
      })
      .catch(() => {
        if (!cancelled) setRoutePath([]);
      });

    return () => {
      cancelled = true;
    };
  }, [positions, post]);

  const handleMoveToCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("이 브라우저에서는 현재 위치를 지원하지 않아요.");
      return;
    }

    setIsLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextLocation = {
          lat: coords.latitude,
          lng: coords.longitude,
        };

        setCurrentLocation(nextLocation);
        setIsLocating(false);

        if (!map || !window.kakao?.maps) return;

        const nextLatLng = new window.kakao.maps.LatLng(nextLocation.lat, nextLocation.lng);
        map.panTo(nextLatLng);
        map.setLevel(3);
      },
      () => {
        setIsLocating(false);
        setLocationError("현재 위치를 가져오지 못했어요. 위치 권한을 확인해 주세요.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    sortedSchedule && sortedSchedule.length > 0 ? (
      <div className="relative w-full h-full">
        {positions.length >= 2 && (
          <SegmentInfoPanel
            sortedSchedule={sortedSchedule}
            positions={positions}
            positionsKey={positionsKey}
            onShowTransitRoute={showTransitRoute}
            activeTransitKey={activeTransitKey}
            onShowRoadRoute={showRoadRoute}
            onSelectRoadRoute={selectRoadRoute}
            roadRoute={activeRoadRoute}
            isOpen={isSegmentInfoOpen}
            onOpenChange={handleSegmentInfoOpenChange}
            panelVariant={segmentPanelVariant}
            activeSegmentIndex={activeSegmentIndex}
            onFocusSegment={focusSegment}
          />
        )}

        <div className={`absolute right-4 top-4 z-10 flex items-center gap-2 transition ${isSegmentInfoOpen ? "max-md:hidden" : ""}`}>
          <div className="hidden rounded-full bg-white/95 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-lg ring-1 ring-slate-200/80 sm:flex sm:items-center sm:gap-2">
            <Route className="h-3.5 w-3.5 text-main" />
            전체 동선 · {positions.length}곳
          </div>
          {(activeSegmentIndex != null || activeTransitKey || activeRoadRoute) && (
            <button
              type="button"
              onClick={resetMapFocus}
              className="flex h-9 items-center gap-1.5 rounded-full bg-slate-900 px-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" /> 전체 보기
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleMoveToCurrentLocation}
          disabled={isLocating}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg ring-1 ring-slate-200 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          <LocateFixed className="h-4 w-4 text-main" />
          {isLocating ? "현재 위치 찾는 중..." : "현재 위치"}
        </button>

        {locationError && (
          <div className="absolute bottom-20 right-4 z-10 max-w-[240px] rounded-2xl bg-white/95 px-3 py-2 text-sm font-medium text-rose-500 shadow-lg ring-1 ring-rose-100">
            {locationError}
          </div>
        )}

        <Map // 지도를 표시할 Container
          center={{
            // 지도의 중심좌표
            lat: 33.452278,
            lng: 126.567803,
          }}
          style={{
            // 지도의 크기
            width: "100%",
            height: "100%",
          }}
          level={3} // 지도의 확대 레벨
          onCreate={setMap}
        >
          {routeSegments.map((segment, index) => {
            const isActive = activeSegmentIndex === index;
            const isDimmed = (activeSegmentIndex != null && !isActive) || activeTransitKey || activeRoadRoute;
            return (
              <Polyline
                key={`route-outline-${index}`}
                path={segment}
                strokeWeight={isActive ? 10 : 8}
                strokeColor="#FFFFFF"
                strokeOpacity={isDimmed ? 0.28 : 0.9}
                strokeStyle="solid"
              />
            );
          })}
          {routeSegments.map((segment, index) => {
            const isActive = activeSegmentIndex === index;
            const isDimmed = (activeSegmentIndex != null && !isActive) || activeTransitKey || activeRoadRoute;
            return (
              <Polyline
                key={`route-${index}`}
                path={segment}
                strokeWeight={isActive ? 6 : 4}
                strokeColor={isActive ? "#1344FF" : "#5B78E5"}
                strokeOpacity={isDimmed ? 0.18 : (isActive ? 1 : 0.72)}
                strokeStyle="solid"
              />
            );
          })}
          {sortedSchedule.map((item, index) => {
            const position = {
              lat: item.place.yLocation ?? item.place.ylocation,
              lng: item.place.xLocation ?? item.place.xlocation,
            };
            const isRelated = activeSegmentIndex === index || activeSegmentIndex === index - 1;
            const isDimmed = activeSegmentIndex != null && !isRelated;

            return (
              <CustomOverlayMap key={item.id} position={position} yAnchor={1.12} zIndex={10} clickable={false}>
                <div className="relative flex flex-col items-center">
                  <div className={`pointer-events-none flex h-8 max-w-[190px] items-center gap-1.5 rounded-full border px-1.5 pr-3 shadow-[0_3px_10px_rgba(15,23,42,0.22)] ${isDimmed ? "border-slate-200 bg-white/90 text-slate-500 opacity-60" : "border-slate-200 bg-white/95 text-slate-800"}`}>
                    <span className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-extrabold text-white ${
                      isDimmed ? "bg-slate-400" : "bg-main"
                    }`}>
                      {index + 1}
                    </span>
                    <span className="min-w-0 truncate whitespace-nowrap text-xs font-bold">
                      {item.place.name}
                    </span>
                  </div>
                </div>
              </CustomOverlayMap>
            );
          })}
          {currentLocation && (
            <MapMarker position={currentLocation}>
              <div className="p-1 w-[159px]" style={{ borderRadius: "4rem" }}>
                <p className="text-lg font-semibold truncate pl-9">
                  현재 위치
                </p>
              </div>
            </MapMarker>
          )}
          {activeRoadRoute?.routes?.[activeRoadRoute.selectedIndex] && (
            <>
              <Polyline
                path={activeRoadRoute.routes[activeRoadRoute.selectedIndex].path}
                strokeColor="#FFFFFF"
                strokeWeight={10}
                strokeOpacity={0.9}
                strokeStyle="solid"
              />
              <Polyline
                path={activeRoadRoute.routes[activeRoadRoute.selectedIndex].path}
                strokeColor={activeRoadRoute.profile === "foot" ? "#475569" : "#1344FF"}
                strokeWeight={activeRoadRoute.profile === "foot" ? 5 : 6}
                strokeOpacity={1}
                strokeStyle={activeRoadRoute.profile === "foot" ? "shortdot" : "solid"}
              />
            </>
          )}
          {transitLanes.map((lane, i) => (
            <Fragment key={i}>
              {lane.isWalk && (
                <Polyline
                  path={lane.path}
                  strokeColor="#FFFFFF"
                  strokeWeight={9}
                  strokeOpacity={0.92}
                  strokeStyle="solid"
                />
              )}
              <Polyline
                path={lane.path}
                strokeColor={lane.color}
                strokeWeight={lane.isWalk ? 5 : 6}
                strokeOpacity={lane.isWalk ? 1 : 0.9}
                strokeStyle={lane.isWalk ? "shortdot" : "solid"}
              />
            </Fragment>
          ))}
        </Map>
      </div>
    ) : (
      <div className="w-full h-full flex-col flex items-center justify-center space-y-2 p-5">
        <p className="text-main text-3xl font-bold">표시할 블록 없음</p>
        <p className="text-lg text-center break-keep">직접추가가 아닌 블록을 추가하면 지도가 보여요.</p>
      </div>
    )
  )
}
