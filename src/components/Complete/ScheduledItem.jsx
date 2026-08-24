import { useState } from "react";
import { BedDouble, Camera, Coffee, ExternalLink, MapPin, Sparkles } from "lucide-react";
import fallbackImage from "../../assets/imgs/default.png";
import DetailPopup from "../Create2/Timetable/DetailPopup";

const CATEGORIES = {
  0: { label: "관광", Icon: Camera, chip: "bg-blue-50 text-[#1344FF]" },
  1: { label: "숙소", Icon: BedDouble, chip: "bg-orange-50 text-orange-600" },
  2: { label: "식당", Icon: Coffee, chip: "bg-emerald-50 text-emerald-600" },
  3: { label: "직접 추가", Icon: Sparkles, chip: "bg-violet-50 text-violet-600" },
  4: { label: "기타", Icon: MapPin, chip: "bg-gray-100 text-gray-600" },
};

export const ScheduledItem = ({ item, START_HOUR, index, isLast }) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const place = item?.place;
  const category = CATEGORIES[place.categoryId] || CATEGORIES[4];
  const Icon = category.Icon;

  const formatTime = (slotIndex) => {
    const totalMin = slotIndex * 15 + START_HOUR * 60;
    return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
  };

  return (
    <li className="group relative grid grid-cols-[52px_14px_minmax(0,1fr)] gap-3 pb-5 sm:grid-cols-[64px_14px_minmax(0,1fr)]">
      <div className="pt-3 text-right">
        <span className="text-sm font-black tabular-nums text-[#111318]">{formatTime(item.start)}</span>
      </div>

      <div className="relative flex justify-center pt-4">
        <span className={`relative z-10 h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm ${index === 0 ? "bg-[#1344FF]" : "bg-[#cfd3da]"}`} />
        {!isLast ? <span className="absolute bottom-[-20px] top-[21px] w-0.5 bg-[#e2e5ea]" aria-hidden="true" /> : null}
      </div>

      <button type="button" onClick={() => setIsDetailOpen(true)} className="min-w-0 overflow-hidden rounded-xl border border-[#ececf0] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#1344FF]/25 hover:shadow-md" aria-label={`${place.name} 상세 보기`}>
        <div className="flex min-h-[132px]">
          <div className="hidden w-[142px] shrink-0 overflow-hidden bg-gray-100 sm:block">
            <img src={place.photoUrl || fallbackImage} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
            <div>
              <div className="mb-2 flex min-w-0 items-center gap-2">
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold ${category.chip}`}><Icon className="h-3.5 w-3.5" />{category.label}</span>
                <h3 className="truncate text-[15px] font-black text-[#111318] sm:text-base">{place.name}</h3>
              </div>
              {place.formatted_address ? <p className="line-clamp-2 text-xs leading-5 text-[#666666]">{place.formatted_address}</p> : null}
              {item.memo ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#1344FF]">{item.memo}</p> : null}
            </div>
            <span className="mt-3 flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#9aa0ab] transition group-hover:border-[#1344FF]/30 group-hover:text-[#1344FF]"><ExternalLink className="h-3.5 w-3.5" /></span>
          </div>
        </div>
      </button>

      {isDetailOpen ? <DetailPopup isOpen onClose={() => setIsDetailOpen(false)} item={item} readOnly onUpdateMemo={() => {}} /> : null}
    </li>
  );
};
