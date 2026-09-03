import { createElement, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  BedDouble,
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  ImageOff,
  Info,
  MapPin,
  Phone,
  Soup,
  Users,
  UtensilsCrossed,
  WalletCards,
  X,
} from "lucide-react";
import { useApiClient } from "../../../hooks/useApiClient";

const CATEGORY_LABEL = {
  ATTRACTION: "관광지",
  ACCOMMODATION: "숙소",
  RESTAURANT: "식당",
};

const cleanText = (value) => {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value).replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
  }
  return "";
};

// Tour API 원문, 배열, {name/title/menuName}, 중첩 객체가 섞여 와도 같은 메뉴 목록으로 만든다.
const normalizeMenus = (value) => {
  const collected = [];
  const visit = (item) => {
    if (item == null) return;
    if (Array.isArray(item)) return item.forEach(visit);
    if (typeof item === "object") {
      const name = cleanText(item.name ?? item.title ?? item.menuName ?? item.menu ?? item.label);
      const price = cleanText(item.price ?? item.menuPrice ?? item.cost);
      if (name) collected.push(price ? `${name} · ${price}` : name);
      else Object.values(item).forEach(visit);
      return;
    }
    cleanText(item)
      .split(/\r?\n|<br\s*\/?>|\s*[|·ㆍ]\s*|\s*,\s*/i)
      .map((menu) => menu.replace(/^[-–•]\s*/, "").trim())
      .filter(Boolean)
      .forEach((menu) => collected.push(menu));
  };
  visit(value);
  return [...new Set(collected)];
};

const DetailRow = ({ icon: Icon, label, value }) => {
  const text = cleanText(value);
  if (!text) return null;
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
      {createElement(Icon, { className: "mt-0.5 h-4 w-4 shrink-0 text-main" })}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400">{label}</p>
        <p className="mt-0.5 whitespace-pre-line break-words text-sm font-medium leading-5 text-slate-700">{text}</p>
      </div>
    </div>
  );
};

export default function PlaceDetailModal({ contentId, fallbackPlace, onClose }) {
  const { get } = useApiClient();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    let cancelled = false;
    get(`${BASE_URL}/api/place/${encodeURIComponent(contentId)}`)
      .then((response) => !cancelled && setDetail(response?.data ?? response))
      .catch((requestError) => {
        if (!cancelled) setError(requestError?.status === 404
          ? "이 장소의 상세 정보는 아직 제공되지 않아요."
          : "상세 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [BASE_URL, contentId, get, onClose]);

  const images = useMemo(() => {
    if (!detail) return [];
    const candidates = [
      ...(detail.images ?? []).flatMap((image) => [image?.originUrl, image?.smallUrl]),
      detail.imageUrl,
      detail.thumbnailUrl,
    ];
    return [...new Set(candidates.filter(Boolean).map((url) => String(url).replace(/^http:\/\//i, "https://")))];
  }, [detail]);

  const restaurantMenus = useMemo(() => normalizeMenus(
    detail?.restaurant?.treatMenu ?? detail?.restaurant?.menus ?? detail?.restaurant?.menu,
  ), [detail]);

  const title = detail?.title ?? fallbackPlace?.name ?? "장소 상세";
  const category = detail?.category;
  const attraction = detail?.attraction;
  const accommodation = detail?.accommodation;
  const restaurant = detail?.restaurant;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:max-h-[88vh] sm:rounded-[28px]"
      >
        <button type="button" onClick={onClose} aria-label="상세 정보 닫기" className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md transition hover:bg-white">
          <X className="h-5 w-5" />
        </button>

        <div className="overflow-y-auto overscroll-contain">
          {loading ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 px-6 text-slate-500">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-main" />
              <p className="text-sm font-semibold">장소 정보를 불러오고 있어요</p>
            </div>
          ) : error ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 px-8 text-center">
              <Info className="h-10 w-10 text-slate-300" />
              <h2 id="place-detail-title" className="text-xl font-extrabold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-500">{error}</p>
            </div>
          ) : (
            <>
              <div className="relative h-56 bg-slate-100 sm:h-72">
                {images.length ? (
                  <img src={images[imageIndex]} alt={`${title} 사진 ${imageIndex + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400"><ImageOff className="h-9 w-9" /><span className="text-sm">등록된 사진이 없어요</span></div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/65 to-transparent" />
                {images.length > 1 && (
                  <>
                    <button type="button" aria-label="이전 사진" onClick={() => setImageIndex((imageIndex - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"><ChevronLeft className="h-5 w-5" /></button>
                    <button type="button" aria-label="다음 사진" onClick={() => setImageIndex((imageIndex + 1) % images.length)} className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"><ChevronRight className="h-5 w-5" /></button>
                    <span className="absolute bottom-4 right-5 rounded-full bg-slate-950/60 px-2.5 py-1 text-xs font-bold text-white">{imageIndex + 1} / {images.length}</span>
                  </>
                )}
              </div>

              <div className="space-y-7 px-5 py-6 sm:px-8 sm:py-8">
                <header>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-main">{CATEGORY_LABEL[category] ?? "장소"}</span>
                  <h2 id="place-detail-title" className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
                  {detail.addr1 && <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{detail.addr1}</p>}
                </header>

                <section>
                  <h3 className="mb-3 text-lg font-extrabold text-slate-900">장소 소개</h3>
                  <p className="whitespace-pre-line break-words text-[15px] leading-7 text-slate-600">{cleanText(detail.overview) || "등록된 소개 정보가 없어요."}</p>
                </section>

                {category === "RESTAURANT" && restaurant && (
                  <section className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 sm:p-5">
                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900"><UtensilsCrossed className="h-5 w-5 text-orange-500" />메뉴</h3>
                    {cleanText(restaurant.firstMenu) && <div className="mt-4 flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"><Soup className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" /><div><p className="text-xs font-bold text-orange-500">대표 메뉴</p><p className="mt-0.5 font-extrabold text-slate-900">{cleanText(restaurant.firstMenu)}</p></div></div>}
                    {restaurantMenus.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{restaurantMenus.map((menu) => <span key={menu} className="rounded-full border border-orange-100 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700">{menu}</span>)}</div> : !cleanText(restaurant.firstMenu) && <p className="mt-3 text-sm text-slate-500">등록된 메뉴 정보가 없어요.</p>}
                  </section>
                )}

                <section>
                  <h3 className="mb-3 text-lg font-extrabold text-slate-900">이용 정보</h3>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {category === "ATTRACTION" && <><DetailRow icon={Clock3} label="이용 시간" value={attraction?.useTime} /><DetailRow icon={CalendarDays} label="쉬는 날" value={attraction?.restDate} /><DetailRow icon={WalletCards} label="이용 요금" value={attraction?.useFee} /><DetailRow icon={Car} label="주차" value={attraction?.parking} /><DetailRow icon={Phone} label="문의" value={attraction?.infoCenter} /></>}
                    {category === "ACCOMMODATION" && <><DetailRow icon={Clock3} label="체크인" value={accommodation?.checkInTime} /><DetailRow icon={Clock3} label="체크아웃" value={accommodation?.checkOutTime} /><DetailRow icon={BedDouble} label="객실 수" value={accommodation?.roomCount} /><DetailRow icon={Car} label="주차" value={accommodation?.parking} /><DetailRow icon={UtensilsCrossed} label="취사" value={accommodation?.cooking} /><DetailRow icon={Phone} label="문의" value={accommodation?.infoCenter} /></>}
                    {category === "RESTAURANT" && <><DetailRow icon={Clock3} label="영업 시간" value={restaurant?.openTime} /><DetailRow icon={CalendarDays} label="쉬는 날" value={restaurant?.restDate} /><DetailRow icon={Car} label="주차" value={restaurant?.parking} /><DetailRow icon={Phone} label="문의" value={restaurant?.infoCenter} /></>}
                  </div>
                </section>

                {category === "ATTRACTION" && attraction?.infoItems?.length > 0 && <section><h3 className="mb-3 text-lg font-extrabold text-slate-900">추가 안내</h3><div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 px-4">{attraction.infoItems.map((item, index) => <div key={`${item.name}-${index}`} className="grid gap-1 py-3 sm:grid-cols-[120px_1fr]"><span className="text-sm font-bold text-slate-500">{cleanText(item.name)}</span><span className="text-sm leading-6 text-slate-700">{cleanText(item.text)}</span></div>)}</div></section>}
                {category === "ACCOMMODATION" && accommodation?.amenities?.length > 0 && <section><h3 className="mb-3 text-lg font-extrabold text-slate-900">편의 시설</h3><div className="flex flex-wrap gap-2">{accommodation.amenities.filter(Boolean).map((amenity) => <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">{amenity}</span>)}</div></section>}
                {category === "ACCOMMODATION" && accommodation?.rooms?.length > 0 && <section><h3 className="mb-3 text-lg font-extrabold text-slate-900">객실 안내</h3><div className="grid gap-3 sm:grid-cols-2">{accommodation.rooms.map((room, index) => <div key={`${room.roomTitle}-${index}`} className="rounded-2xl border border-slate-200 p-4"><p className="font-extrabold text-slate-900">{cleanText(room.roomTitle) || `객실 ${index + 1}`}</p><div className="mt-2 space-y-1 text-sm text-slate-500">{cleanText(room.roomSize) && <p>{room.roomSize}㎡</p>}{(room.baseCount || room.maxCount) && <p className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />기준 {room.baseCount || "-"}명 · 최대 {room.maxCount || "-"}명</p>}<p className="text-xs">객실 요금은 실제 예약가와 다를 수 있어요.</p></div></div>)}</div></section>}

                {detail.homepage && <a href={detail.homepage} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800">공식 홈페이지 <ExternalLink className="h-4 w-4" /></a>}
              </div>
            </>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
