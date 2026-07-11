import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faStar, faMapMarkerAlt, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

const DetailPopup = ({ isOpen, onClose, item, onUpdateMemo, readOnly = false }) => {
  const [memo, setMemo] = useState(item?.memo || "");
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (isOpen) {
      // 이미 창이 열려있고 사용자가 입력 중일 때는 prop 기반의 setMemo를 스킵하거나
      // 값이 명확히 다를 때만 업데이트하도록 할 수 있습니다. 
      // 여기서는 창이 열릴 때만 초기화하거나 item.id가 바뀔 때만 초기화하도록 변경합니다.
      setMemo(item?.memo || "");
      // 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, item?.id]); // item 대신 item.id를 사용하여 메모 입력 도중 리렌더링으로 인한 초기화 방지

  if (!isOpen || !item) return null;

  const { place } = item;
  const imageUrl = place.placeId
    ? `${BASE_URL}/image/place/${encodeURIComponent(place.placeId)}`
    : (place.photoUrl || place.iconUrl);

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 font-pretendard">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="bg-white rounded-2xl w-[90%] max-w-md overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200">

        {/* Header Photo */}
        <div className="h-48 w-full bg-gray-200 relative">
          <img 
            src={imageUrl} 
            alt={place.name}
            className="w-full h-full object-cover"
            onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = place.iconUrl;
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h2 className="text-white text-2xl font-bold truncate">{place.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="bg-main/10 text-main px-2 py-1 rounded text-xs font-semibold">
                {place.categoryId === 0 ? "관광지" : place.categoryId === 1 ? "숙소" : place.categoryId === 2 ? "식당" : "장소"}
              </span>
              {place.rating != null && (
                <div className="flex items-center text-yellow-500 font-bold">
                  <FontAwesomeIcon icon={faStar} className="mr-1" />
                  {place.rating}
                </div>
              )}
            </div>
            {place.url && (
              <a 
                href={place.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-main transition-colors"
                title="Google Maps에서 보기"
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} />
              </a>
            )}
          </div>

          {place.formatted_address && (
            <div className="flex items-start text-gray-600 text-sm">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 mr-2 shrink-0" />
              <span>{place.formatted_address}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">메모</label>
            <textarea
              className={`w-full h-64 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 resize-none text-sm ${readOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-gray-50'}`}
              placeholder={readOnly ? "메모가 없습니다." : "일정에 대한 메모를 남겨보세요."}
              value={memo}
              readOnly={readOnly}
              onChange={(e) => {
                if (readOnly) return;
                const newMemo = e.target.value;
                setMemo(newMemo);
                onUpdateMemo(newMemo);
              }}
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-main text-white font-bold rounded-lg hover:bg-mainDark transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default DetailPopup;
