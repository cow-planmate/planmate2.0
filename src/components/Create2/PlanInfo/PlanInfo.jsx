import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePlanStore from "../../../store/Plan";
import useUserStore from "../../../store/Users";
import { v4 as uuidv4 } from 'uuid';
import { useApiClient } from "../../../hooks/useApiClient";
import { sendRedo, sendUndo } from "../../../websocket/client";

import Login from "../../auth/Login";
import PasswordFind from "../../auth/PasswordFind";
import Signup from "../../auth/Signup";
import Theme from "../../auth/Theme";
import Themestart from "../../auth/Themestart";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faUserPlus, faInfo, faRotateLeft, faRotateRight, faUsers, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { faMap } from "@fortawesome/free-regular-svg-icons";

import PlanInfoModal from "./PlanInfoModal";
import ShareModal from "../../common/ShareModal";
import MapModal from "./MapModal";
import NoLoginSave from "./NoLoginSave";
import UsersModal from "./UsersModal";

import UndoIcon from "../../../assets/imgs/undo.svg?react";
import RedoIcon from "../../../assets/imgs/redo.svg?react";

export default function PlanInfo({ id }) {
  const {
    planName,
    transportationCategoryId,
    setPlanField,
    planId
  } = usePlanStore();
  const { users } = useUserStore();
  const { isAuthenticated } = useApiClient();

  const navigate = useNavigate();

  const flexCenter = "flex items-center";
  const infoButton = "rounded-lg py-1 px-2 hover:bg-gray-100";

  const spanRef = useRef(null);
  const inputRef = useRef(null);
  const [localName, setLocalName] = useState(planName);
  const [inputWidth, setInputWidth] = useState('auto');

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPasswordFindOpen, setIsPasswordFindOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isThemestartOpen, setIsThemestartOpen] = useState(false);
  const [selectedThemeKeywords, setSelectedThemeKeywords] = useState({
    tourist: [],
    accommodation: [],
    restaurant: [],
  });
  const [isSaveOpen, setIsSaveOpen] = useState(false);

  const [step, setStep] = useState(0);

  const handleLoginOpen = () => {
    setStep(1);
    setIsLoginOpen(true);
  };

  const handleLoginClose = () => {
    setIsLoginOpen(false);
  };

  const handlePasswordFindOpen = () => {
    setIsLoginOpen(false);
    setIsPasswordFindOpen(true);
  };

  const handlePasswordFindClose = () => {
    setIsPasswordFindOpen(false);
    setIsLoginOpen(true);
  };

  const handleSignupOpen = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const handleSignupClose = () => {
    setIsSignupOpen(false);
  };

  const handleThemeOpen = () => {
    setIsThemeOpen(true);
  };

  const handleThemeClose = () => {
    setIsThemeOpen(false);
  };

  const handleThemeComplete = (keywords) => {
    setSelectedThemeKeywords(keywords);
    setIsThemeOpen(false);
  };

  const handleThemestartOpen = () => {
    setIsThemestartOpen(true);
  };

  const handleThemestartClose = () => {
    setIsThemestartOpen(false);
    setStep(2);
  };

  const refreshUserProfile = () => {
    setStep(2);
  }

  useEffect(() => {
    if (step === 2) {
      setIsSaveOpen(true);
    }
  }, [step]);

  const handleSave = () => {
    if (!isAuthenticated()) {
      handleLoginOpen();
      return;
    }
    setStep(2);
  }

  useEffect(() => {
    setLocalName(planName);
  }, [planName]);

  useEffect(() => {
    if (spanRef.current) {
      const spanWidth = spanRef.current.getBoundingClientRect().width;
      setInputWidth(`${Math.max(spanWidth, 8)}px`);
    }
  }, [localName]);

  return (
    <div className={`mx-auto min-[1464px]:w-[1416px] min-[1464px]:px-0 md:px-6 md:pt-6 p-3 pb-0 ${flexCenter} justify-between w-full`}>
      <div className={`${flexCenter} sm:space-x-3 space-x-1 min-w-0 flex-1`}>
        <div className="min-w-0 flex-shrink">
          <input
            ref={inputRef}
            type="text"
            className={`${infoButton} box-content text-lg font-semibold max-w-full`}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={() => setPlanField("planName", localName)}
            style={{
              width: inputWidth,
              minWidth: '8px',
              maxWidth: '100%'
            }}
            value={localName}
          />
        </div>
        {planId !== -1 &&
          <div className="flex">
            <button
              onClick={() => sendUndo(id)}
              className="sm:size-7 size-5 hover:bg-gray-200 bg-white rounded-full flex items-center justify-center"
              title="되돌리기 (Ctrl+Z)"
            >
              <UndoIcon />
            </button>
            <button
              onClick={() => sendRedo(id)}
              className="sm:size-7 size-5 hover:bg-gray-200 bg-white rounded-full flex items-center justify-center"
              title="다시실행 (Ctrl+Y / Ctrl+Shift+Z)"
            >
              <RedoIcon />
            </button>
          </div>
        }
        <button
          className="flex items-center justify-center text-sm rounded-full bg-gray-300 hover:bg-gray-400 size-7 md:size-9"
          onClick={() => setIsInfoOpen(true)}
        >
          <div className="text-sm"><FontAwesomeIcon icon={faInfo} /></div>
        </button>
        <div className={`hidden md:flex whitespace-nowrap flex-shrink-0 ${flexCenter} py-2 px-3 border border-gray-300 rounded-full`}>
          <span className="text-gray-500 mr-1 text-sm">이동수단</span>
          <select value={transportationCategoryId} onChange={(e) => setPlanField("transportationCategoryId", e.target.value)}>
            <option value='0'>대중교통</option>
            <option value='1'>자동차</option>
          </select>
        </div>
      </div>
      <div className={`${flexCenter} mx-2 sm:w-auto`}>
        <div className={`space-x-1 sm:space-x-3 ${flexCenter}`}>
          <div className="-space-x-2 hidden sm:flex sm:items-center">
            {users?.slice(0, 2).map((user) => {
              return (
                <div
                  key={uuidv4()}
                  className="rounded-full size-10 border-2 border-white bg-contain bg-no-repeat group/tooltip relative cursor-pointer"
                  style={
                    user.userInfo.email ? {
                      backgroundImage: `url('${user.userInfo.email}')`
                    } : {
                      backgroundImage: "url('./src/assets/imgs/default.png')"
                    }
                  }
                >
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-[200px] bg-gray-800 text-white text-xs rounded-md px-3 py-2 z-50 hidden group-hover/tooltip:block whitespace-normal break-keep shadow-lg after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-gray-800 text-center">
                    {user.userInfo.nickname}
                  </div>
                </div>
              )
            })}
            {users && users.length > 2 && (
              <button
                className="text-sm rounded-full bg-gray-300 hover:bg-gray-400 p-2 size-10 border-2 border-white"
                onClick={() => setIsUsersOpen(true)}
              >
                +{users.length - 2}
              </button>
            )}
          </div>
          {planId !== -1 &&
            <button
              className="flex items-center justify-center sm:hidden text-sm rounded-full border border-main hover:bg-gray-100 size-7"
              onClick={() => setIsUsersOpen(true)}
            >
              <div className="text-sm text-main"><FontAwesomeIcon icon={faUsers} /></div>
            </button>
          }
          <button
            onClick={() => setIsMapOpen(true)}
            className="flex items-center justify-center text-sm sm:text-base sm:px-4 p-2 rounded-full sm:rounded-lg border border-gray-500 hover:bg-gray-100 sm:size-auto size-7"
          >
            <div className="block sm:hidden"><FontAwesomeIcon icon={faMap} /></div>
            <div className="hidden sm:block">지도로 보기</div>
          </button>
          {planId === -1 ?
            <>
              <button
                onClick={handleSave}
                className="flex items-center justify-center text-sm sm:text-base sm:px-4 p-2 rounded-full sm:rounded-lg bg-main hover:bg-mainDark text-white sm:size-auto size-7"
              >
                <div className="block sm:hidden"><FontAwesomeIcon icon={faFloppyDisk} /></div>
                <div className="hidden sm:block">저장</div>
              </button>
            </>
            :
            <>
              <button
                onClick={() => setIsShareOpen(true)}
                className="flex items-center justify-center text-sm sm:text-base sm:px-4 p-2 rounded-full sm:rounded-lg bg-gray-300 hover:bg-gray-400 sm:size-auto size-7"
              >
                <div className="block sm:hidden"><FontAwesomeIcon icon={faUserPlus} /></div>
                <div className="hidden sm:block">공유</div>
              </button>
              <button
                onClick={() => navigate(`/complete?id=${id}`)}
                className="flex items-center justify-center text-sm sm:text-base sm:px-4 p-2 rounded-full sm:rounded-lg bg-main hover:bg-mainDark text-white sm:size-auto size-7"
              >
                <div className="block sm:hidden"><FontAwesomeIcon icon={faCheck} /></div>
                <div className="hidden sm:block">완료</div>
              </button>
            </>
          }
        </div>
      </div>

      <span
        ref={spanRef}
        className="invisible absolute whitespace-pre text-lg font-semibold"
      >
        {localName}
      </span>

      {isInfoOpen && <PlanInfoModal setIsInfoOpen={setIsInfoOpen} />}

      {isUsersOpen && <UsersModal setIsUsersOpen={setIsUsersOpen} />}

      {isShareOpen && <ShareModal
        isOwner={true}
        setIsShareOpen={setIsShareOpen}
        id={id}
      />}

      {isMapOpen && <MapModal setIsMapOpen={setIsMapOpen} />}

      {step === 1 &&
        <>
          <Login
            isOpen={isLoginOpen}
            onClose={handleLoginClose}
            onPasswordFindOpen={handlePasswordFindOpen}
            onSignupOpen={handleSignupOpen}
            onLoginSuccess={refreshUserProfile}
          />
          <PasswordFind
            isOpen={isPasswordFindOpen}
            onClose={handlePasswordFindClose}
          />
          <Signup
            isOpen={isSignupOpen}
            onClose={handleSignupClose}
            onThemeOpen={handleThemestartOpen}
            selectedThemeKeywords={selectedThemeKeywords}
            onLoginSuccess={null}
          />
          <Theme
            isOpen={isThemeOpen}
            onClose={handleThemeClose}
            onComplete={handleThemeComplete}
          />
          <Themestart
            isOpen={isThemestartOpen}
            onClose={handleThemestartClose}
            onThemeOpen={handleThemeOpen}
            selectedThemeKeywords={selectedThemeKeywords}
          />
        </>
      }

      {step === 2 &&
        <NoLoginSave isOpen={isSaveOpen} />
      }
    </div>
  )
}