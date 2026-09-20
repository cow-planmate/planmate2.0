import { Info, MapPinned } from "lucide-react";
import { useState, type SyntheticEvent } from "react";
import PlaceDetailModal from "../Create2/Place/PlaceDetailModal";
import {
  buildNaverMapUrl,
  getPlaceAddress,
  getPlaceContentId,
  getPlaceTitle,
  isTourPlaceContentId,
} from "../../utils/naverMapLink";

interface PlaceActionButtonsProps {
  place: object;
  className?: string;
  buttonClassName?: string;
  labelButtons?: boolean;
  onShowDetail?: () => void;
}

export function PlaceActionButtons({
  place,
  className = "",
  buttonClassName,
  labelButtons = false,
  onShowDetail,
}: PlaceActionButtonsProps) {
  const [showInternalDetail, setShowInternalDetail] = useState(false);
  const contentId = getPlaceContentId(place);
  const detailContentId = isTourPlaceContentId(place) ? contentId : null;
  const naverMapUrl = buildNaverMapUrl(place);
  const title = getPlaceTitle(place) || "장소";
  const canShowDetail = Boolean(onShowDetail || title);

  const stopInteraction = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  const buttonClass = buttonClassName ?? (labelButtons
    ? "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1344FF]"
    : "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1344FF]");

  return (
    <>
      <div
        className={`flex flex-wrap items-center gap-1.5 ${className}`}
        onClick={stopInteraction}
        onPointerDown={stopInteraction}
      >
        {canShowDetail ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (onShowDetail) onShowDetail();
              else setShowInternalDetail(true);
            }}
            className={buttonClass}
            aria-label={`${title} 상세 정보 보기`}
            title="상세 정보"
          >
            <Info className="h-4 w-4" />
            {labelButtons ? "상세정보" : null}
          </button>
        ) : null}

        {naverMapUrl ? (
          <a
            href={naverMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={stopInteraction}
            className={buttonClass}
            aria-label={`${title} 지도에서 보기`}
            title="지도"
          >
            <MapPinned className="h-4 w-4" />
            {labelButtons ? "지도" : null}
          </a>
        ) : null}
      </div>

      {showInternalDetail ? (
        <PlaceDetailModal
          contentId={detailContentId}
          fallbackPlace={{
            ...place,
            name: getPlaceTitle(place),
            formatted_address: getPlaceAddress(place),
          }}
          onClose={() => setShowInternalDetail(false)}
        />
      ) : null}
    </>
  );
}
