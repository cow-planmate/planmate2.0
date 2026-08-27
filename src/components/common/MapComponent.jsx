import { useEffect, useMemo, useState } from "react";
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
  const [transitLanes, setTransitLanes] = useState([]); // [{ color, path:[{lat,lng}] }]
  const [activeTransitKey, setActiveTransitKey] = useState(null);
  const [isSegmentInfoOpen, setIsSegmentInfoOpen] = useState(defaultSegmentInfoOpen);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(null);
  const [activePlaceIndex, setActivePlaceIndex] = useState(null);

  const handleSegmentInfoOpenChange = (nextOpen) => {
    if (nextOpen && onSegmentInfoRequest) {
      onSegmentInfoRequest();
      return;
    }
    setIsSegmentInfoOpen(nextOpen);
  };

  // 선택한 대중교통 경로(mapObj)의 폴리라인을 지도에 그린다. 같은 카드를 다시 누르면 지운다.
  const showTransitRoute = async (mapObj, key) => {
    if (key === activeTransitKey) {
      setTransitLanes([]);
      setActiveTransitKey(null);
      setActiveSegmentIndex(null);
      return;
    }
    try {
      const res = await post(`${import.meta.env.VITE_API_URL}/api/route/transit/lane`, { mapObj });
      const lanes = (res?.lanes ?? []).map((lane) => ({
        color:
          lane.trafficClass === 1
            ? BUS_COLOR
            : SUBWAY_COLORS[lane.type] || "#3B82F6",
        path: (lane.path ?? []).map((p) => ({ lat: p.lat, lng: p.lng })),
      }));
      setTransitLanes(lanes);
      setActiveTransitKey(key);
      setActiveSegmentIndex(Number.parseInt(key.split("-")[0], 10));
      setActivePlaceIndex(null);
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
    setActivePlaceIndex(null);
    setTransitLanes([]);
    setActiveTransitKey(null);
  };

  const focusSegment = (index) => {
    setActiveSegmentIndex((current) => current === index ? null : index);
    setActivePlaceIndex(null);
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
          {(activeSegmentIndex != null || activePlaceIndex != null || activeTransitKey) && (
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
            const isDimmed = (activeSegmentIndex != null && !isActive) || activeTransitKey;
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
            const isDimmed = (activeSegmentIndex != null && !isActive) || activeTransitKey;
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
            const isActive = activePlaceIndex === index;
            const isRelated = activeSegmentIndex === index || activeSegmentIndex === index - 1;
            const isDimmed = activeSegmentIndex != null && !isRelated;

            return (
              <CustomOverlayMap key={item.id} position={position} yAnchor={1.12} zIndex={isActive ? 12 : 10}>
                <div className="relative flex flex-col items-center">
                  {isActive && (
                    <div className="mb-2 w-[190px] rounded-2xl bg-white p-3 shadow-[0_8px_28px_rgba(15,23,42,0.22)] ring-1 ring-slate-200">
                      <p className="truncate text-sm font-extrabold text-slate-900">{item.place.name}</p>
                      {item.place.url && (
                        <a href={item.place.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-bold text-main hover:underline">
                          장소 정보 보기
                        </a>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setActivePlaceIndex(isActive ? null : index);
                      setActiveSegmentIndex(null);
                    }}
                    aria-label={`${index + 1}번 ${item.place.name}${isActive ? " 정보 닫기" : " 정보 보기"}`}
                    title={item.place.name}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white text-sm font-extrabold text-white shadow-[0_3px_12px_rgba(15,23,42,0.3)] transition hover:-translate-y-0.5 hover:scale-105 ${
                      isActive ? "scale-110 bg-slate-900" : isDimmed ? "bg-slate-400 opacity-60" : "bg-main"
                    }`}
                  >
                    {index + 1}
                  </button>
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
          {transitLanes.map((lane, i) => (
            <Polyline
              key={i}
              path={lane.path}
              strokeColor={lane.color}
              strokeWeight={5}
              strokeOpacity={0.85}
            />
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
