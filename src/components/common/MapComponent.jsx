import { useEffect, useState } from "react";
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../hooks/useKakaoLoader";
import { useApiClient } from "../../hooks/useApiClient";
import SegmentInfoPanel, { SUBWAY_COLORS, BUS_COLOR } from "./SegmentInfoPanel";

export default function MapComponent({ schedule }) {
  useKakaoLoader()
  const { post } = useApiClient();

  const [map, setMap] = useState();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [routePath, setRoutePath] = useState([]);
  const [transitLanes, setTransitLanes] = useState([]); // [{ color, path:[{lat,lng}] }]
  const [activeTransitKey, setActiveTransitKey] = useState(null);

  // 선택한 대중교통 경로(mapObj)의 폴리라인을 지도에 그린다. 같은 카드를 다시 누르면 지운다.
  const showTransitRoute = async (mapObj, key) => {
    if (key === activeTransitKey) {
      setTransitLanes([]);
      setActiveTransitKey(null);
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
    } catch {
      // 폴리라인 조회 실패 시 조용히 무시(기존 지도 상태 유지)
    }
  };

  const isValidPosition = (place) =>
    (place?.yLocation != null || place?.ylocation != null) && (place?.xLocation != null || place?.xlocation != null);

  const sortedSchedule = [...schedule]
    .sort((a, b) => a.start - b.start)
    .filter((item) => isValidPosition(item.place));

  const positions = sortedSchedule
    .map((item, index) => ({
      index, // ← 원래 순서 번호 유지용
      lat: isValidPosition(item.place) ? (item.place.yLocation ?? item.place.ylocation) : null,
      lng: isValidPosition(item.place) ? (item.place.xLocation ?? item.place.xlocation) : null,
    }))
    .filter(pos => pos.lat != null && pos.lng != null);

  const positionsKey = positions
    .map((pos) => `${pos.lat},${pos.lng}`)
    .join("|");

  // useEffect를 사용하여 map 인스턴스가 생성된 후 한 번만 실행되도록 설정
  useEffect(() => {
    if (!map || positions.length === 0) return; // map 인스턴스가 아직 생성되지 않았다면 아무것도 하지 않음

    // LatLngBounds 객체에 모든 마커의 좌표를 추가합니다.
    const bounds = new window.kakao.maps.LatLngBounds();
    positions.forEach((pos) => {
      bounds.extend(new window.kakao.maps.LatLng(pos.lat, pos.lng));
    });

    // 계산된 bounds를 지도에 적용합니다.
    map.setBounds(bounds);
  }, [map, positionsKey]);

  // 도로를 따라가는 실제 경로를 백엔드(OSRM 길찾기)에서 받아온다.
  // 실패 시 routePath는 빈 배열로 남아 직선(positions)으로 대체된다.
  useEffect(() => {
    setRoutePath([]); // 좌표가 바뀌면 이전 경로 잔상을 지운다

    if (positions.length < 2) {
      return;
    }

    let cancelled = false;

    post(`${import.meta.env.VITE_API_URL}/api/route/directions`, {
      waypoints: positions.map((pos) => ({ lat: pos.lat, lng: pos.lng })),
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
  }, [positionsKey]);

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
          />
        )}

        <button
          type="button"
          onClick={handleMoveToCurrentLocation}
          disabled={isLocating}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg ring-1 ring-slate-200 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-main/10 text-main">
            ⌖
          </span>
          {isLocating ? "현재 위치 찾는 중..." : "현재 위치"}
        </button>

        {locationError && (
          <div className="absolute bottom-20 right-4 z-10 max-w-[240px] rounded-2xl bg-white/95 px-3 py-2 text-sm font-medium text-rose-500 shadow-lg ring-1 ring-rose-100">
            {locationError}
          </div>
        )}

        <Map // 지도를 표시할 Container
          id="map"
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
          {sortedSchedule.map((item, index) => {
            return (
              <MapMarker
                key={item.id}
                position={{
                  lat: item.place.yLocation || item.place.ylocation,
                  lng: item.place.xLocation || item.place.xlocation,
                }}
              >
                <div className="p-2 w-[159px]" style={{ borderRadius: "4rem" }}>
                  <p className="text-lg font-semibold truncate">
                    {item.place.name}
                  </p>
                  <div className="flex items-center space-x-1">
                    <div className="text-sm w-[22px] h-[22px] border border-main text-main font-semibold rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <a
                      href={item.place.url}
                      className="text-sm hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      장소 정보 보기
                    </a>
                  </div>
                </div>
              </MapMarker>
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
          {positions.length > 1 && (
            <Polyline
              path={
                routePath.length > 0
                  ? routePath.map(pos => ({ lat: pos.lat, lng: pos.lng }))
                  : positions.map(pos => ({ lat: pos.lat, lng: pos.lng }))
              }
              strokeWeight={4}
              strokeColor="#1344FF"
              strokeOpacity={0.5}
              strokeStyle={routePath.length > 0 ? "solid" : "dash"}
            />
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