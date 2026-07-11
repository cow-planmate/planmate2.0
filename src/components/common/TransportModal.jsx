import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar, faBus, faTimes } from "@fortawesome/free-solid-svg-icons";

const TransportModal = ({
  isOpen,
  onClose,
  selectedTransport,
  onTransportChange,
}) => {
  if (!isOpen) return null;

  const handleTransportSelect = (transport) => {
    onTransportChange(transport);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="bg-white rounded-lg p-6 w-96 relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-pretendard font-bold mb-6 text-center">
          이동수단 선택
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleTransportSelect("bus")}
            className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center gap-3 ${
              selectedTransport === "bus"
                ? "border-main bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <FontAwesomeIcon icon={faBus} className="text-3xl text-main" />
            <span className="font-pretendard font-medium">대중교통</span>
          </button>

          <button
            onClick={() => handleTransportSelect("car")}
            className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center gap-3 ${
              selectedTransport === "car"
                ? "border-main bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <FontAwesomeIcon icon={faCar} className="text-3xl text-main" />
            <span className="font-pretendard font-medium">자동차</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransportModal;
