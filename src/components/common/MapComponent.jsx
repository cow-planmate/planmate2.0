import { useEffect, useState } from "react";
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../hooks/useKakaoLoader";

export default function MapComponent({ schedule }) {
  useKakaoLoader()

  const [map, setMap] = useState();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

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
              path={positions.map(pos => ({
                lat: pos.lat,
                lng: pos.lng,
              }))}
              strokeWeight={4}
              strokeColor="#1344FF"
              strokeOpacity={0.5}
              strokeStyle="dash"
            />
          )}
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