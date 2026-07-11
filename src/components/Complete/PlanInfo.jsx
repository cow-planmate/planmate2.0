import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faUserPlus, faInfo, faPen } from "@fortawesome/free-solid-svg-icons";

import PlanInfoModal from "./PlanInfoModal";
import ShareModal from "../common/ShareModal";

export default function PlanInfo({ planFrame }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const flexCenter = "flex items-center";

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <div className={`mx-auto min-[1464px]:w-[1416px] min-[1464px]:px-0 md:px-6 md:pt-6 p-3 pb-0 ${flexCenter} justify-between w-full`}>
      <div className={`${flexCenter} space-x-1 sm:space-x-3`}>
        <div className="rounded-lg py-1 px-2 text-lg font-semibold">
          {planFrame.planName}
        </div>
        <button
          className="flex items-center justify-center text-sm rounded-full bg-gray-300 hover:bg-gray-400 p-2 size-7 md:size-9"
          onClick={() => setIsInfoOpen(true)}
        >
          <FontAwesomeIcon icon={faInfo} />
        </button>
      </div>
      <div className={`${flexCenter} mx-2 sm:w-auto`}>
        <div className={`space-x-1 sm:space-x-3 ${flexCenter}`}>
          <button
            onClick={() => navigate(`/create?id=${id}`)}
            className="flex items-center justify-center text-sm sm:text-base sm:px-4 p-2 rounded-full sm:rounded-lg border border-gray-500 hover:bg-gray-100 sm:size-auto size-7"
          >
            <div className="block sm:hidden"><FontAwesomeIcon icon={faPen} /></div>
            <div className="hidden sm:block">수정</div>
          </button>
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center justify-center text-sm sm:text-base sm:px-4 p-2 rounded-full sm:rounded-lg bg-gray-300 hover:bg-gray-400 sm:size-auto size-7"
          >
            <div className="block sm:hidden"><FontAwesomeIcon icon={faUserPlus} /></div>
            <div className="hidden sm:block">공유</div>
          </button>
          <button
            onClick={() => navigate(`/mypage`)}
            className="flex items-center justify-center text-sm sm:text-base sm:px-4 p-2 rounded-full sm:rounded-lg bg-main hover:bg-mainDark text-white sm:size-auto size-7"
          >
            <div className="block sm:hidden"><FontAwesomeIcon icon={faCheck} /></div>
            <div className="hidden sm:block">확인</div>
          </button>
        </div>
      </div>

      {isInfoOpen && <PlanInfoModal
        setIsInfoOpen={setIsInfoOpen}
        planFrame={planFrame}
      />}

      {isShareOpen && <ShareModal
        isOwner={true}
        setIsShareOpen={setIsShareOpen}
        id={id}
      />}
    </div>
  )
}