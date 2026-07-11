import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import usePlanStore from "../../../store/Plan";
import { useState } from "react";

import TransportModal from "./TransportModal";
import PersonCountModal from "../../common/PersonCountModal";
import LocationModal from "../../common/LocationModal";

export default function PlanInfoModal({setIsInfoOpen}) {
  const { 
    travelName,
    transportationCategoryId,
    adultCount, 
    childCount,
    setPlanField
  } = usePlanStore();

  const infoButton = "rounded-lg p-2 hover:bg-gray-100 w-full";
  const flexCenter = "flex items-center";
  const transInfo = {0: "대중교통", 1: "자동차"};

  const [isPersonCountOpen, setIsPersonCountOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [isTransportOpen, setIsTransportOpen] = useState(false); 

  const handlePersonCountClose = () => setIsPersonCountOpen(false);
  const handleDestinationClose = () => setIsDestinationOpen(false);

  const handlePersonCountChange = (count) => {
    setPlanField("adultCount", count.adults);
    setPlanField("childCount", count.children);
  };

  const handleDestinationLocationSelect = (location) => {
    setPlanField("travelId", location.id);
    setPlanField("travelCategoryName", location.name.split(" ")[0]);
    setPlanField("travelName", location.name.split(" ").pop());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm font-pretendard">
      <div className="relative bg-white p-4 rounded-2xl shadow-2xl sm:w-[580px] w-[90vw] border border-gray-100 max-h-[90vh] overflow-y-auto space-y-2">
        <div className="flex justify-between items-center px-2 pt-2">
          <div className="font-bold text-xl text-gray-800">
            일정 정보
          </div>
          <button 
            className="text-2xl hover:bg-gray-100 w-8 h-8 rounded-full"
            onClick={() => setIsInfoOpen(false)}
          >
            ×
          </button>
        </div>
        <p className="text-sm px-2 pb-2 text-main break-keep"><FontAwesomeIcon className="mr-1" icon={faCircleInfo}/> 각 영역을 클릭하면 정보를 수정할 수 있어요.</p>
        <button
          onClick={() => setIsPersonCountOpen(true)}
          className={infoButton}
        >
          <div className="space-y-1.5">
            <p className="text-gray-500 text-start font-semibold">인원 수</p>

            <div className={flexCenter}>
              <p className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs mr-2">
                성인
              </p>
              <p className="mr-4">{adultCount}명</p>

              <p className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs mr-2">
                어린이
              </p>
              <p className="">{childCount}명</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setIsDestinationOpen(true)}
          className={infoButton}
        >
          <div className="space-y-1.5">
            <p className="text-gray-500 text-start font-semibold">여행지</p>
            <p className="text text-start max-w-full truncate">{travelName}</p>
          </div>
        </button>
        <button
          onClick={() => setIsTransportOpen(true)}
          className={infoButton}
        >
          <div className="space-y-1.5">
            <p className="text-gray-500 text-start font-semibold">이동수단</p>
            <p className="text text-start max-w-full">{transInfo[transportationCategoryId]}</p>
          </div>
        </button>
      </div>
      
      <PersonCountModal
        isOpen={isPersonCountOpen}
        onClose={handlePersonCountClose}
        personCount={{adults: adultCount, children: childCount}}
        onPersonCountChange={handlePersonCountChange}
      />

      <LocationModal
        isOpen={isDestinationOpen}
        onClose={handleDestinationClose}
        onLocationSelect={handleDestinationLocationSelect}
        title="여행지 검색"
        placeholder="여행지를 입력해주세요"
      />
      
      {isTransportOpen && <TransportModal
        setIsTransportOpen={setIsTransportOpen}
      />}

    </div>
  )
}