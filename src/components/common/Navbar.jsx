import Logo from "../../assets/imgs/logo.svg?react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Login from "../auth/Login";
import PasswordFind from "../auth/PasswordFind";
import Signup from "../auth/Signup";
import Theme from "../auth/Theme";
import Themestart from "../auth/Themestart"; // 추가된 import
import { useState, useEffect, useRef } from "react";
import { useApiClient } from "../../hooks/useApiClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faHouseUser,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import { faBell as faBellRegular } from "@fortawesome/free-regular-svg-icons";
import useNicknameStore from "../../store/Nickname";
import FeedbackModal from "../common/Feedback";

export default function Navbar({ onInvitationAccept }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPasswordFindOpen, setIsPasswordFindOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isThemestartOpen, setIsThemestartOpen] = useState(false); // 추가된 state
  const [selectedThemeKeywords, setSelectedThemeKeywords] = useState({
    tourist: [],
    accommodation: [],
    restaurant: [],
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInvitationOpen, setisInvitationOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [isFeedbackOpen, setisFeedbackOpen] = useState(false);

  const { nickname, gravatar } = useNicknameStore();

  const location = useLocation();
  const navigate = useNavigate();

  const handleMypage = () => {
    if (location.pathname === "/mypage") {
      window.location.reload();
    } else {
      navigate("/mypage");
    }
  };

  const { get, post, isAuthenticated, logout } = useApiClient();
  const BASE_URL = import.meta.env.VITE_API_URL;

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    await logout();

    window.location.href = "/";
  };

  const handleLoginOpen = () => {
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

  // 추가된 함수들
  const handleThemestartOpen = () => {
    setIsThemestartOpen(true);
  };

  const handleThemestartClose = () => {
    setIsThemestartOpen(false);
  };

  // 로그인 성공 후 프로필 정보 새로고침을 위한 함수
  const refreshUserProfile = async () => {
    // if (isAuthenticated()) {
    //   importNickname();
    // }
    console.log("이거 뭐하는 거임?"); // <- 용도를 모르겠어서 함수 내용들 다 지우고 넣었는데 저렇게 냅둬도 잘 굴러감.
  };

  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const acceptRequest = async (requestId) => {
    try {
      await post(`${BASE_URL}/api/collaboration-requests/${requestId}/accept`);
      fetchInvitations();
      console.log("초대 수락 완료");

      if (onInvitationAccept) {
        onInvitationAccept();
      }
    } catch (err) {
      console.error("초대 수락 실패:", err);
    }
  };
  const rejectRequest = async (requestId) => {
    try {
      await post(`${BASE_URL}/api/collaboration-requests/${requestId}/reject`);
      fetchInvitations();
      console.log("초대 거절 완료");
    } catch (err) {
      console.error("초대 거절 실패:", err);
    }
  };
  const fetchInvitations = async () => {
    if (isAuthenticated()) {
      try {
        const response = await get(
          `${BASE_URL}/api/collaboration-requests/pending`
        );
        console.log(response);
        setInvitations(response.pendingRequests || []);
      } catch (err) {
        console.error("초대 목록을 가져오는데 실패했습니다:", err);
      }
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [nickname]);



  return (
    <div className="border-b border-gray-200 ">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 bg-white flex justify-between py-4 items-center">
        <div className="flex-shrink-0">
          <Link to="/">
            <Logo className="h-6 sm:h-8" />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-[35px] flex items-center mr-2 sm:mr-4">
            {" "}
            <button
              onClick={() => setisFeedbackOpen((prev) => !prev)}
              className="inline-flex items-center justify-center h-[40px] px-3 sm:px-4 py-2 bg-blue-600 ease-in-out delay-75 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
            >
              <FontAwesomeIcon icon={faPencil} className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">피드백하러가기</span>
            </button>
          </div>
          {isAuthenticated() ? (
            <div className="relative" ref={wrapperRef}>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileOpen((prev) => !prev);
                  }}
                >
                  <div className="flex items-center h-[35px]">
                    <div
                      className="w-8 h-8 bg-no-repeat bg-contain rounded-full mr-2 sm:mr-3"
                      style={
                        gravatar
                          ? {
                            backgroundImage: `url('${gravatar}')`,
                          }
                          : {
                            backgroundImage:
                              "url('./src/assets/imgs/default.png')",
                          }
                      }
                    ></div>
                    <span>{nickname}님</span>
                  </div>
                </button>

                <button
                  className="relative flex items-center"
                  onClick={() => {
                    setisInvitationOpen((prev) => !prev);
                    if (!isInvitationOpen) {
                      fetchInvitations();
                    }
                  }}
                >
                  <FontAwesomeIcon
                    icon={faBellRegular}
                    className="text-gray-500 text-[20px] align-middle hover:text-gray-400"
                  />
                  {invitations.length > 0 && (
                    <span className="absolute -bottom-1 left-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </div>
              {isProfileOpen && (
                <div className="absolute right-0 sm:right-8 top-full w-36 p-2 bg-white border rounded-lg shadow-md z-50">
                  <button
                    className="w-full flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={handleMypage}
                  >
                    <FontAwesomeIcon className="mr-3 w-4" icon={faHouseUser} />
                    마이페이지
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                  >
                    <FontAwesomeIcon
                      className="mr-3 w-4"
                      icon={faRightFromBracket}
                    />
                    로그아웃
                  </button>
                </div>
              )}

              {isInvitationOpen && (
                <div className="absolute right-0 top-full w-72 sm:w-80 bg-white border rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <div
                      className="flex justify-between items-center mb-4"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      <h3 className="text-lg font-semibold">초대 알림</h3>
                      <button
                        onClick={() => setisInvitationOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {invitations.length > 0 ? (
                        invitations.map((invitation) => (
                          <div
                            key={invitation.requestId}
                            className="border border-gray-200 rounded-lg p-3"
                          >
                            <div className="text-sm text-gray-600 mb-2">
                              '
                              <span className="font-medium">
                                {invitation.senderNickname}
                              </span>
                              ' 님께서 '{invitation.planName}' 협업 초대를
                              보냈습니다
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  acceptRequest(invitation.requestId)
                                }
                                className="flex-1 bg-main text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600"
                              >
                                수락
                              </button>
                              <button
                                onClick={() =>
                                  rejectRequest(invitation.requestId)
                                }
                                className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-400"
                              >
                                거절
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          받은 초대가 없습니다
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[35px] flex items-center gap-2">

              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                onClick={handleLoginOpen}
              >
                로그인/회원가입
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 모든 모달들을 Navbar에서 관리 */}
      <Login
        isOpen={isLoginOpen}
        onClose={handleLoginClose}
        onPasswordFindOpen={handlePasswordFindOpen}
        onSignupOpen={handleSignupOpen}
        onLoginSuccess={refreshUserProfile} // 로그인 성공 후 프로필 새로고침
      />
      <PasswordFind
        isOpen={isPasswordFindOpen}
        onClose={handlePasswordFindClose}
      />
      <Signup
        isOpen={isSignupOpen}
        onClose={handleSignupClose}
        onThemeOpen={handleThemestartOpen} // 추가된 prop
        selectedThemeKeywords={selectedThemeKeywords}
        onLoginSuccess={refreshUserProfile}
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
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setisFeedbackOpen(false)}
      />
    </div >
  );
}
