import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar, faBus } from "@fortawesome/free-solid-svg-icons";
import usePlanStore from "../../../store/Plan";

const TransportModal = ({
  setIsTransportOpen,
}) => {
  const { transportationCategoryId, setPlanField } = usePlanStore();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setIsTransportOpen(false)}
    >
      <div className="bg-white rounded-lg p-6 w-96 relative">
        <button
          onClick={() => setIsTransportOpen(false)}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-pretendard font-bold mb-6 text-center">
          이동수단 선택
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setPlanField("transportationCategoryId", 0)}
            className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center gap-3 ${
              transportationCategoryId === 0
                ? "border-main bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <FontAwesomeIcon icon={faBus} className="text-3xl text-main" />
            <span className="font-pretendard font-medium">대중교통</span>
          </button>

          <button
            onClick={() => setPlanField("transportationCategoryId", 1)}
            className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center gap-3 ${
              transportationCategoryId === 1
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
