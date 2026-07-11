import defaultImg from "../../assets/imgs/default.png";

const PlaceItem = ({ place }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify(place));
  };

  // Build image URL from backend: GET /image/place/{placeId}
  const placeId = place?.placeId || place?.place_id || place?.id;
  const BASE_URL = import.meta.env.VITE_API_URL;
  const imageUrl = placeId ? `${BASE_URL}/image/place/${encodeURIComponent(placeId)}` : place?.iconUrl;

  return (
    <div
      className="flex items-center p-5 cursor-move border-b border-gray-300 hover:bg-gray-100"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="w-12 h-12 bg-gray-300 rounded-lg mr-4 flex items-center justify-center">
        <img
          src={imageUrl || defaultImg}
          alt={place.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = place?.iconUrl || defaultImg;
          }}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex-1 space-y-1">
        <div className="font-bold text-xl">{place.name}</div>
        <div className="flex items-center space-x-2">
          <p>
            <span className="text-yellow-400">★</span> {place.rating}
          </p>
          <span className="text-gray-500">{place.formatted_address}</span>
        </div>
      </div>
      <button
        onClick={() => window.open(place.url)}
        className="px-2 py-1 hover:bg-gray-200 rounded-lg border border-gray-300"
      >
        구글 맵스
      </button>
    </div>
  );
};

export default PlaceItem;