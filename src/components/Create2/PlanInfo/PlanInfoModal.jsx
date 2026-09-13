import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { createPortal } from "react-dom";
import usePlanStore from "../../../store/Plan";
import { useEffect, useState } from "react";

import PersonCountModal from "../../common/PersonCountModal";
import LocationModal from "../../common/LocationModal";

export default function PlanInfoModal({setIsInfoOpen}) {
  const {
    planName,
    destinationName,
    adultCount,
    childCount,
    setPlanField
  } = usePlanStore();

  const infoButton = "rounded-lg p-2 hover:bg-gray-100 w-full";
  const flexCenter = "flex items-center";

  const [isPersonCountOpen, setIsPersonCountOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [isPlanNameEditOpen, setIsPlanNameEditOpen] = useState(false);
  const [localPlanName, setLocalPlanName] = useState(planName);

  useEffect(() => {
    setLocalPlanName(planName);
  }, [planName]);

  const openPlanNameEditor = () => {
    setLocalPlanName(planName);
    setIsPlanNameEditOpen(true);
  };

  const closePlanNameEditor = () => {
    setLocalPlanName(planName);
    setIsPlanNameEditOpen(false);
  };

  const commitPlanName = (event) => {
    event.preventDefault();
    const nextPlanName = localPlanName.trim();
    if (!nextPlanName) return;
    if (nextPlanName !== planName) setPlanField("planName", nextPlanName);
    setIsPlanNameEditOpen(false);
  };

  const handlePersonCountClose = () => setIsPersonCountOpen(false);
  const handleDestinationClose = () => setIsDestinationOpen(false);

  const handlePersonCountChange = (count) => {
    setPlanField("adultCount", count.adults);
    setPlanField("childCount", count.children);
  };

  const handleDestinationLocationSelect = (location) => {
    setPlanField("destinationId", location.id);
    setPlanField("destinationName", location.name);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm font-pretendard"
      data-tutorial-modal="plan-info"
    >
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
          type="button"
          onClick={openPlanNameEditor}
          className={`${infoButton} text-left`}
        >
          <span className="min-w-0 space-y-1.5">
            <span className="block font-semibold text-gray-500">일정 제목</span>
            <span className="block truncate font-semibold text-gray-900">{planName || "제목 없음"}</span>
          </span>
        </button>
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
            <p className="text text-start max-w-full truncate">{destinationName}</p>
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

      {isPlanNameEditOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[130] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) closePlanNameEditor();
              }}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="plan-name-edit-title"
                className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl"
              >
                <form onSubmit={commitPlanName}>
                  <h2 id="plan-name-edit-title" className="text-xl font-bold text-gray-900">
                    일정 제목 수정
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">일정에서 사용할 제목을 입력해 주세요.</p>
                  <label htmlFor="plan-info-name" className="sr-only">일정 제목</label>
                  <input
                    id="plan-info-name"
                    type="text"
                    value={localPlanName}
                    onChange={(event) => setLocalPlanName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") closePlanNameEditor();
                    }}
                    maxLength={100}
                    autoFocus
                    placeholder="일정 제목을 입력해 주세요"
                    className="mt-6 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base font-semibold text-gray-900 outline-none transition focus:border-main focus:ring-2 focus:ring-blue-100"
                  />
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closePlanNameEditor}
                      className="rounded-xl bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={!localPlanName.trim()}
                      className="rounded-xl bg-main px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      수정
                    </button>
                  </div>
                </form>
              </section>
            </div>,
            document.body,
          )
        : null}
      
    </div>
  )
}
