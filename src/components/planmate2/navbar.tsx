import {
  Bell,
  LogOut,
  Menu,
  MessageSquare,
  User,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApiClient } from "../../hooks/useApiClient";
import { getAccessToken } from "../../shared/auth/tokenStore";
import useNicknameStore from "../../store/Nickname";
// @ts-ignore
import Logo from "../../assets/imgs/logo.svg?react";
// @ts-ignore
import Login from "../auth/Login";
// @ts-ignore
import Signup from "../auth/Signup";
// @ts-ignore
import PasswordFind from "../auth/PasswordFind";
// @ts-ignore
import Theme from "../auth/Theme";
// @ts-ignore
import Themestart from "../auth/Themestart";
// @ts-ignore
import FeedbackModal from "../common/Feedback";
// @ts-ignore
import { ErrorToast, SuccessToast } from "../common/Toast";

type MyPageMenuSection = "profile" | "trips" | "community";

interface NavbarProps {
  currentView: string;
  onNavigate: (
    view: "feed" | "community" | "create" | "mypage" | "plan-maker" | "social",
  ) => void;
  onInvitationAccept?: () => void | Promise<void>;
}

export default function Navbar({
  currentView,
  onNavigate,
  onInvitationAccept,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMyPageOpen, setIsMobileMyPageOpen] = useState(false);

  const handleMyPageSectionSelect = (section: MyPageMenuSection) => {
    setIsProfileMenuOpen(false);
    setIsMobileMyPageOpen(false);
    setIsMobileMenuOpen(false);
    onNavigate("mypage", { section });
  };

  // 인증 관련 상태
  const { get, post, isAuthenticated, logout } = useApiClient();
  const { gravatar, nickname, profileImage } = useNicknameStore();
  // 프로필 사진을 올렸으면 그것을, 아니면 이메일 기반 gravatar를 쓴다
  const avatarUrl = profileImage || gravatar;

  // 환경변수 중복 사용 방지를 위한 변수화
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isPasswordFindOpen, setIsPasswordFindOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isThemestartOpen, setIsThemestartOpen] = useState(false);
  const [selectedThemeKeywords, setSelectedThemeKeywords] = useState<
    Record<string, any[]>
  >({});
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("openPreferredThemeOnboarding") !== "true") {
      return;
    }

    sessionStorage.removeItem("openPreferredThemeOnboarding");
    setIsThemestartOpen(true);
  }, []);

  // 알림(초대) 관련 상태
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  interface Invitation {
    collaborationRequestId: number;
    senderNickname: string;
    planName: string;
    type?: "INVITE" | "REQUEST";
  }

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isNewNotificationVisible, setIsNewNotificationVisible] =
    useState(false);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const hideNewNotification = useCallback(() => {
    setIsNewNotificationVisible(false);
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
      notificationTimerRef.current = null;
    }
  }, []);

  const showNewNotification = useCallback(() => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setIsNewNotificationVisible(true);
    notificationTimerRef.current = setTimeout(() => {
      setIsNewNotificationVisible(false);
      notificationTimerRef.current = null;
    }, 5000);
  }, []);

  const fetchInvitations = useCallback(async () => {
    if (isAuthenticated()) {
      try {
        const response = await get(
          `${BASE_URL}/api/collaboration-requests/pending`,
        );
        const requests = (response.requests || [])
          .map((request: any) => ({
            collaborationRequestId:
              request.collaborationRequestId ?? request.requestId ?? request.id,
            senderNickname: request.senderNickname,
            planName: request.planName,
            type: request.type,
          }))
          .filter(
            (request: Invitation) =>
              request.collaborationRequestId !== undefined &&
              request.collaborationRequestId !== null,
          );
        setInvitations(requests);
      } catch (err) {
        console.error("초대 목록을 가져오는데 실패했습니다:", err);
      }
    }
  }, [BASE_URL, get, isAuthenticated]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations, nickname, currentView]); // 로그인 완료 및 화면 이동 시 목록을 새로 불러옴

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const eventSource = new EventSource(
      `${BASE_URL}/api/sse/subscribe?token=${encodeURIComponent(token)}`,
    );
    const handleNewInvitation = () => {
      showNewNotification();
      void fetchInvitations();
    };
    const refreshPendingRequests = () => {
      void fetchInvitations();
    };

    eventSource.addEventListener("invitation", handleNewInvitation);
    eventSource.addEventListener("requestResult", refreshPendingRequests);

    return () => {
      eventSource.removeEventListener("invitation", handleNewInvitation);
      eventSource.removeEventListener("requestResult", refreshPendingRequests);
      eventSource.close();
    };
  }, [BASE_URL, fetchInvitations, nickname, showNewNotification]);

  useEffect(() => hideNewNotification, [hideNewNotification]);

  const acceptRequest = async (collaborationRequestId: number) => {
    try {
      await post(
        `${BASE_URL}/api/collaboration-requests/${collaborationRequestId}/accept`,
      );
      SuccessToast("일정 초대를 수락했습니다.");
      await fetchInvitations();
      await onInvitationAccept?.();
    } catch (err: any) {
      ErrorToast(err?.message || "초대 수락에 실패했습니다.");
      console.error("초대 수락 실패:", err);
    }
  };

  const rejectRequest = async (collaborationRequestId: number) => {
    try {
      await post(
        `${BASE_URL}/api/collaboration-requests/${collaborationRequestId}/reject`,
      );
      SuccessToast("일정 초대를 거절했습니다.");
      await fetchInvitations();
    } catch (err: any) {
      ErrorToast(err?.message || "초대 거절에 실패했습니다.");
      console.error("초대 거절 실패:", err);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleLoginSuccess = () => {
    setIsLoginOpen(false);
    window.location.reload();
  };

  return (
    <nav className="bg-white border-b border-[#dfe1e6] sticky top-0 z-50 h-[70px] w-full">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-8 h-full">
        <div className="flex items-center h-full">
          {/* 로고 */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => onNavigate("feed")}
          >
            <Logo className="h-6 w-auto" />
          </div>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex flex-1 items-center gap-2 ml-7">
            <button
              onClick={() => onNavigate("feed")}
              className={`relative px-3 py-6 font-bold transition-colors text-[16px] after:absolute after:bottom-[18px] after:left-3 after:right-3 after:h-0.5 ${
                currentView === "feed"
                  ? "text-[#111318] after:bg-[#1344FF]"
                  : "text-[#343740] after:bg-transparent hover:text-[#1344FF]"
              }`}
            >
              여행기
            </button>
            <button
              onClick={() => onNavigate("community")}
              className={`relative px-3 py-6 font-bold transition-colors text-[16px] after:absolute after:bottom-[18px] after:left-3 after:right-3 after:h-0.5 ${
                currentView === "community" || currentView === "board-list"
                  ? "text-[#111318] after:bg-[#1344FF]"
                  : "text-[#343740] after:bg-transparent hover:text-[#1344FF]"
              }`}
            >
              커뮤니티
            </button>
            <button
              onClick={() => onNavigate("plan-maker")}
              className={`relative px-3 py-6 font-bold transition-colors text-[16px] after:absolute after:bottom-[18px] after:left-3 after:right-3 after:h-0.5 ${
                currentView === "plan-maker"
                  ? "text-[#111318] after:bg-[#1344FF]"
                  : "text-[#343740] after:bg-transparent hover:text-[#1344FF]"
              }`}
            >
              일정 만들기
            </button>

            {isAuthenticated() ? (
              <div className="flex items-center gap-2 ml-auto relative">
                {/* Profile Button */}
                <button
                  onClick={() => {
                    setIsProfileMenuOpen((open) => !open);
                    setIsInvitationOpen(false); // 💡 UX 개선: 프로필 열 때 알림창 닫기
                  }}
                  className={`flex items-center gap-2 p-1 pr-3 rounded-full transition-all ${
                    currentView === "mypage" || isProfileMenuOpen
                      ? "bg-blue-50 ring-1 ring-blue-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border border-gray-100 shadow-sm object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#666666]" />
                    </div>
                  )}
                  <span className="text-sm font-bold text-gray-700">
                    {nickname}님
                  </span>
                </button>

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      hideNewNotification();
                      setIsInvitationOpen(!isInvitationOpen);
                      setIsProfileMenuOpen(false); // 💡 UX 개선: 알림창 열 때 프로필 닫기
                      if (!isInvitationOpen) fetchInvitations();
                    }}
                    className={`p-2 rounded-full transition-all relative ${
                      isInvitationOpen
                        ? "bg-gray-100 text-[#1344FF]"
                        : "text-[#666666] hover:bg-gray-50"
                    }`}
                  >
                    <Bell className="w-6 h-6" />
                    {invitations.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>

                  {isNewNotificationVisible && !isInvitationOpen && (
                    <button
                      type="button"
                      role="status"
                      aria-live="polite"
                      onClick={() => {
                        hideNewNotification();
                        setIsInvitationOpen(true);
                        setIsProfileMenuOpen(false);
                        void fetchInvitations();
                      }}
                      className="absolute right-0 top-12 z-30 w-max max-w-[260px] rounded-xl border border-[#dce5ff] bg-white px-3.5 py-3 text-left shadow-[0_10px_30px_rgba(17,24,39,0.14)] transition-all animate-in fade-in slide-in-from-top-2 duration-200 before:absolute before:-top-1.5 before:right-4 before:h-3 before:w-3 before:rotate-45 before:border-l before:border-t before:border-[#dce5ff] before:bg-white hover:-translate-y-0.5 hover:border-[#bfd0ff] hover:shadow-[0_14px_34px_rgba(17,24,39,0.18)]"
                    >
                      <span className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef3ff] text-[#1344FF]">
                          <Bell className="h-3.5 w-3.5" />
                        </span>
                        <span>
                          <span className="block text-sm font-bold leading-5 text-[#20232a]">
                            새로운 알림이 도착했어요
                          </span>
                          <span className="mt-0.5 block text-xs leading-4 text-[#747986]">
                            눌러서 알림 내용을 확인해 보세요
                          </span>
                        </span>
                      </span>
                    </button>
                  )}

                  {/* Invitation Dropdown */}
                  {isInvitationOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsInvitationOpen(false)}
                      ></div>
                      <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-20 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            초대 알람
                          </h3>
                          <button
                            onClick={() => setIsInvitationOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                          {invitations.length > 0 ? (
                            invitations.map((invitation) => (
                              <div
                                key={invitation.collaborationRequestId}
                                className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                              >
                                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                  <span className="font-bold text-gray-900">
                                    {invitation.senderNickname}
                                  </span>
                                  님이
                                  <br />
                                  <span className="font-bold text-[#1344FF]">
                                    '{invitation.planName}'
                                  </span>{" "}
                                  {invitation.type === "REQUEST"
                                    ? "일정의 편집 권한을 요청했습니다."
                                    : "일정 편집 초대를 보냈습니다."}
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      acceptRequest(
                                        invitation.collaborationRequestId,
                                      )
                                    }
                                    className="flex-1 bg-[#1344FF] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#0031E6] transition-colors"
                                  >
                                    수락
                                  </button>
                                  <button
                                    onClick={() =>
                                      rejectRequest(
                                        invitation.collaborationRequestId,
                                      )
                                    }
                                    className="flex-1 bg-white text-gray-600 py-2 rounded-lg text-xs font-bold border border-gray-200 hover:bg-gray-100 transition-colors"
                                  >
                                    거절
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-8 text-center">
                              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2 opacity-50" />
                              <p className="text-sm text-gray-400">
                                새로운 알람이 없습니다.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileMenuOpen(false)}
                    ></div>
                    <div
                      className="absolute top-14 right-0 w-[290px] rounded-[20px] border border-slate-200 bg-white p-2.5 shadow-[0_18px_45px_-18px_rgba(15,23,42,0.3)] z-20 animate-in fade-in slide-in-from-top-2"
                    >
                      <div className="flex items-center gap-2 px-3 pb-2 pt-1.5 text-[13px] font-extrabold text-slate-900">
                        <User className="h-4 w-4 text-[#1344FF]" />
                        마이페이지
                      </div>
                      <div className="border-l border-slate-200 pl-2 ml-5 mb-2">
                        {[
                          ["profile", "프로필"],
                          ["trips", "여행 일정 및 캘린더"],
                          ["community", "커뮤니티 활동"],
                        ].map(([section, label]) => (
                          <button
                            key={section}
                            type="button"
                            onClick={() => handleMyPageSectionSelect(section as MyPageMenuSection)}
                            className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#1344FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1344FF]"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-slate-100 pt-1.5">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        로그아웃
                      </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-6 py-2.5 rounded-xl font-bold bg-[#f0f4ff] text-[#1344FF] hover:bg-[#e0e7ff] transition-all ml-auto"
              >
                로그인
              </button>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="ml-auto flex items-center gap-2 md:hidden">
            {isAuthenticated() && (
              <div className="relative">
                <Bell
                  className={`w-6 h-6 ${invitations.length > 0 ? "text-[#1344FF]" : "text-[#666666]"}`}
                  onClick={() => {
                    // 모바일에서는 알림 클릭 시 마이페이지(또는 알림 페이지)로 넘기도록 된 로직 유지
                    onNavigate("mypage");
                  }}
                />
                {invitations.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#666666] hover:text-[#1344FF] p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="absolute inset-x-0 top-full md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-[#e5e7eb] bg-white px-6 py-4 shadow-lg space-y-2">
            <button
              onClick={() => {
                onNavigate("feed");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                currentView === "feed"
                  ? "bg-[#1344FF] text-white"
                  : "text-[#666666] hover:bg-[#f0f4ff] hover:text-[#1344FF]"
              }`}
            >
              여행기 피드
            </button>
            <button
              onClick={() => {
                onNavigate("community");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                currentView === "community" || currentView === "board-list" // 💡 메뉴 활성화 조건 일치시킴
                  ? "bg-[#1344FF] text-white"
                  : "text-[#666666] hover:bg-[#f0f4ff] hover:text-[#1344FF]"
              }`}
            >
              커뮤니티
            </button>
            <button
              onClick={() => {
                onNavigate("plan-maker");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                currentView === "plan-maker"
                  ? "bg-[#1344FF] text-white"
                  : "text-[#666666] hover:bg-[#f0f4ff] hover:text-[#1344FF]"
              }`}
            >
              여행 일정 생성
            </button>

            <button
              onClick={() => {
                setIsFeedbackOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 text-[#666666] hover:bg-[#f0f4ff] hover:text-[#1344FF]"
            >
              <MessageSquare className="w-5 h-5" />
              피드백
            </button>

            {isAuthenticated() ? (
              <>
                <button
                  onClick={() => setIsMobileMyPageOpen((open) => !open)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                    currentView === "mypage"
                      ? "bg-[#1344FF] text-white"
                      : "text-[#666666] hover:bg-[#f0f4ff] hover:text-[#1344FF]"
                  }`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  마이페이지
                </button>
                {isMobileMyPageOpen ? (
                  <div className="ml-5 border-l border-slate-200 pl-3">
                    {[
                      ["profile", "프로필"],
                      ["trips", "여행 일정 및 캘린더"],
                      ["community", "커뮤니티 활동"],
                    ].map(([section, label]) => (
                      <button
                        key={section}
                        type="button"
                        onClick={() => handleMyPageSectionSelect(section as MyPageMenuSection)}
                        className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#1344FF]"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : null}
                <button
                  onClick={() => {
                    onNavigate("social");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                    currentView === "social"
                      ? "bg-[#1344FF] text-white"
                      : "text-[#666666] hover:bg-[#f0f4ff] hover:text-[#1344FF]"
                  }`}
                >
                  <Users className="w-5 h-5" />
                  소셜
                </button>
                {/* 💡 모바일 메뉴에 로그아웃 추가 (유저 편의성) */}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 text-red-500 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  로그아웃
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-center px-4 py-3 rounded-xl font-bold bg-[#f0f4ff] text-[#1344FF] hover:bg-[#e0e7ff] transition-all"
              >
                로그인
              </button>
            )}
          </div>
        )}
      </div>

      {/* 인증 모달들 */}
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
      <Signup
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onLoginOpen={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
        onThemeOpen={() => {
          setIsSignupOpen(false);
          setIsThemestartOpen(true);
        }}
      />
      <PasswordFind
        isOpen={isPasswordFindOpen}
        onClose={() => setIsPasswordFindOpen(false)}
      />
      <Theme
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        initialSelected={selectedThemeKeywords}
        onComplete={(keywords: Record<string, any[]>) => {
          setSelectedThemeKeywords(keywords);
          setIsThemeOpen(false);
        }}
      />
      <Themestart
        isOpen={isThemestartOpen}
        onClose={() => setIsThemestartOpen(false)}
        onThemeOpen={() => setIsThemeOpen(true)}
        selectedThemeKeywords={selectedThemeKeywords}
      />
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </nav>
  );
}
