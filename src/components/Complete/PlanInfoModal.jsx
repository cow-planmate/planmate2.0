export default function PlanInfoModal({setIsInfoOpen, planFrame}) {
  const infodiv = "rounded-lg p-2 w-full";
  const flexCenter = "flex items-center";
  const transInfo = {0: "대중교통", 1: "자동차"};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm font-pretendard">
      <div className="relative bg-white p-4 rounded-2xl shadow-2xl sm:w-[580px] w-[90vw] border border-gray-100 max-h-[90vh] overflow-y-auto space-y-2">
        <div className="flex justify-between items-center px-2 pt-2">
          <div className="font-bold text-lg">
            일정 정보
          </div>
          <button 
            className="text-2xl hover:bg-gray-100 w-8 h-8 rounded-full"
            onClick={() => setIsInfoOpen(false)}
          >
            ×
          </button>
        </div>
        <div className={infodiv}>
          <div className="space-y-1.5">
            <p className="text-gray-500 text-start font-semibold">인원 수</p>

            <div className={flexCenter}>
              <p className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs mr-2">
                성인
              </p>
              <p className="mr-4">{planFrame.adultCount}명</p>

              <p className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs mr-2">
                어린이
              </p>
              <p className="">{planFrame.childCount}명</p>
            </div>
          </div>
        </div>
        <div
          className={infodiv}
        >
          <div className="space-y-1.5">
            <p className="text-gray-500 text-start font-semibold">여행지</p>
            <p className="text text-start max-w-full truncate">{planFrame.travelName}</p>
          </div>
        </div>
        <div
          className={infodiv}
        >
          <div className="space-y-1.5">
            <p className="text-gray-500 text-start font-semibold">이동수단</p>
            <p className="text text-start max-w-full">{transInfo[planFrame.transportationCategoryId]}</p>
          </div>
        </div>
      </div>
    </div>
  )
}