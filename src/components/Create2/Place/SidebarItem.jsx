import { useDraggable } from "@dnd-kit/core";
import MapIcon from "../../../assets/imgs/googlemaps.svg?react"; // 경로 확인 필요

export const SidebarItem = ({
  place,
  duration,
  isMobile,
  onMobileAdd,
  onDelete,
}) => {
  const BASE_URL = import.meta.env.VITE_API_URL;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${place.placeId}`,
    data: { type: "sidebar", place, duration, originalId: place.placeId },
    disabled: isMobile,
  });

  const imageUrl = place.placeId
    ? `${BASE_URL}/image/place/${encodeURIComponent(place.placeId)}`
    : place.iconUrl;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`px-5 py-3 md:py-5 bg-white hover:shadow-md flex items-center cursor-grab active:cursor-grabbing select-none
        ${isDragging ? "opacity-40 ring-2 ring-blue-400" : ""}`}
    >
      <div className="size-10 md:size-12 bg-gray-300 rounded-lg mr-4 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={place.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = place.iconUrl;
          }}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex-1 md:space-y-1 min-w-0">
        <p className="font-bold text-lg md:text-xl">{place.name}</p>
        <div className="flex items-center space-x-2 whitespace-nowrap">
          {place.rating != null && (
            <p>
              <span className="text-yellow-400">★</span> {place.rating}
            </p>
          )}
          {place.formatted_address && (
            <span className="text-gray-500 truncate block">
              {place.formatted_address}
            </span>
          )}
        </div>
      </div>
      <div className="space-x-2 flex items-center">
        {place.url && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(place.url);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-lg border border-gray-300"
          >
            <MapIcon className="h-6 block" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-8 h-8 flex items-center justify-center hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-lg border border-gray-300"
            aria-label="리스트에서 삭제"
          >
            ×
          </button>
        )}
        {isMobile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMobileAdd();
            }}
            className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold"
          >
            추가
          </button>
        )}
      </div>
    </div>
  );
};
