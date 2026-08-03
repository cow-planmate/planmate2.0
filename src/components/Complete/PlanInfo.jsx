import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faUserPlus, faInfo, faPen } from "@fortawesome/free-solid-svg-icons";

import PlanInfoModal from "./PlanInfoModal";
import ShareModal from "../common/ShareModal";
import Login from "../auth/Login";
import PasswordFind from "../auth/PasswordFind";
import Signup from "../auth/Signup";
import { ErrorToast } from "../common/Toast";
import { useApiClient } from "../../hooks/useApiClient";

export default function PlanInfo({ planFrame, isOwner }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const { isAuthenticated } = useApiClient();

  const flexCenter = "flex items-center";

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPasswordFindOpen, setIsPasswordFindOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const handleEdit = () => {
    if (!isAuthenticated()) {
      ErrorToast("로그인이 필요합니다.");
      setIsLoginOpen(true);
      return;
    }

    navigate(`/create?id=${id}`);
  };

  const handleLoginSuccess = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(false);
    navigate(`/create?id=${id}`);
  };

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
            onClick={handleEdit}
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
        isOwner={isOwner}
        setIsShareOpen={setIsShareOpen}
        id={id}
      />}

      <Login
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onPasswordFindOpen={() => {
          setIsLoginOpen(false);
          setIsPasswordFindOpen(true);
        }}
        onSignupOpen={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      <PasswordFind
        isOpen={isPasswordFindOpen}
        onClose={() => {
          setIsPasswordFindOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <Signup
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}
