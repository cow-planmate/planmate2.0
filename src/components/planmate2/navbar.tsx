import {
  Bell,
  History,
  LogIn,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApiClient } from "../../hooks/useApiClient";
import { getAccessToken } from "../../shared/auth/tokenStore";
import useNicknameStore from "../../store/Nickname";
import {
  clearRecentPlan,
  getRecentPlan,
  RECENT_PLAN_UPDATED_EVENT,
} from "../../utils/recentPlanSession";
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
import { ErrorToast, SuccessToast } from "../common/Toast";

type MyPageMenuSection = "profile" | "trips" | "community";

const MOBILE_NAV_ITEMS = [
  { view: "feed", label: "여행기" },
  { view: "community", label: "커뮤니티" },
  { view: "plan-maker", label: "일정생성" },
] as const;

const MY_PAGE_MENU_ITEMS = [
  ["profile", "프로필"],
  ["trips", "여행 일정 및 캘린더"],
  ["community", "커뮤니티 활동"],
] as const;

interface NavbarProps {
  currentView: string;
  onNavigate: (
    view: "feed" | "community" | "create" | "mypage" | "plan-maker" | "social",
    data?: Record<string, any>,
  ) => void;
  onInvitationAccept?: () => void | Promise<void>;
}

export default function Navbar({
  currentView,
  onNavigate,
  onInvitationAccept,
}: NavbarProps) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [recentPlan, setRecentPlan] = useState(() => getRecentPlan());

  const isScheduleEditor = currentView === "schedule-editor";

  const continueRecentPlan = () => {
    if (!recentPlan) return;
    setIsMobileMenuOpen(false);
    navigate(recentPlan.path);
  };

  const handleMyPageSectionSelect = (section: MyPageMenuSection) => {
    setIsProfileMenuOpen(false);
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
  useEffect(() => {
    if (sessionStorage.getItem("openPreferredThemeOnboarding") !== "true") {
      return;
    }

    sessionStorage.removeItem("openPreferredThemeOnboarding");
    setIsThemestartOpen(true);
  }, []);

  useEffect(() => {
    const refreshRecentPlan = () => setRecentPlan(getRecentPlan());
    window.addEventListener(RECENT_PLAN_UPDATED_EVENT, refreshRecentPlan);
    window.addEventListener("storage", refreshRecentPlan);
    return () => {
      window.removeEventListener(RECENT_PLAN_UPDATED_EVENT, refreshRecentPlan);
      window.removeEventListener("storage", refreshRecentPlan);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

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
    clearRecentPlan();
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
            onClick={() => onNavigate("plan-maker")}
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
              일정생성
            </button>

            {recentPlan && !isScheduleEditor ? (
              <div className="group relative ml-auto mr-1 shrink-0">
                <button
                  type="button"
                  onClick={continueRecentPlan}
                  className="flex h-9 items-center gap-1.5 rounded-lg bg-gray-50 px-3 text-[13px] font-bold text-[#4b5563] transition-colors hover:bg-gray-100 hover:text-[#343740] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1344FF]/25"
                  aria-label={`${recentPlan.planName} 최근 일정 편집`}
                  aria-describedby="recent-plan-tooltip"
                >
                  <History className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="hidden whitespace-nowrap lg:inline">
                    최근 일정 편집
                  </span>
                </button>

                <div
                  id="recent-plan-tooltip"
                  role="tooltip"
                  className="pointer-events-none invisible absolute right-0 top-[calc(100%+10px)] z-30 w-max max-w-[320px] translate-y-1 rounded-lg bg-[#1344FF] px-3.5 py-2.5 text-xs font-semibold leading-5 text-white opacity-0 shadow-[0_8px_20px_rgba(19,68,255,0.22)] transition duration-150 before:absolute before:-top-1 before:right-5 before:h-2 before:w-2 before:rotate-45 before:bg-[#1344FF] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
                >
                  직전까지 작업 중이던 &quot;{recentPlan.planName}&quot;을
                  이어서 편집해 보세요!
                </div>
              </div>
            ) : null}

            {isAuthenticated() ? (
              <div
                className={`flex items-center gap-2 relative ${
                  recentPlan && !isScheduleEditor ? "" : "ml-auto"
                }`}
              >
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
                        {MY_PAGE_MENU_ITEMS.map(([section, label]) => (
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
                className={`px-6 py-2.5 rounded-xl font-bold bg-[#f0f4ff] text-[#1344FF] hover:bg-[#e0e7ff] transition-all ${
                  recentPlan && !isScheduleEditor ? "" : "ml-auto"
                }`}
              >
                로그인
              </button>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="ml-auto flex items-center gap-2 md:hidden">
            {isAuthenticated() && (
              <button
                type="button"
                aria-label="알림 보기"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-[#1344FF]"
                onClick={() => onNavigate("mypage")}
              >
                <Bell
                  className={`h-5 w-5 ${invitations.length > 0 ? "text-[#1344FF]" : ""}`}
                  onClick={() => {
                    onNavigate("mypage");
                  }}
                />
                {invitations.length > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                isMobileMenuOpen
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#1344FF]"
              }`}
              aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <>
            <button
              type="button"
              aria-label="모바일 메뉴 닫기"
              className="fixed inset-x-0 bottom-0 top-[70px] z-10 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside
              aria-label="모바일 전체 메뉴"
              className="animate-in fade-in slide-in-from-top-2 absolute right-3 top-[calc(100%+8px)] z-20 w-[calc(100%-1.5rem)] max-w-[320px] overflow-hidden rounded-[20px] border border-slate-200 bg-white p-2.5 shadow-[0_18px_45px_-18px_rgba(15,23,42,0.3)] md:hidden"
            >
              <div className="space-y-0.5">
                {MOBILE_NAV_ITEMS.map(({ view, label }) => {
                  const isActive = view === "community"
                    ? currentView === "community" || currentView === "board-list"
                    : currentView === view;

                  return (
                    <button
                      key={view}
                      type="button"
                      onClick={() => {
                        onNavigate(view);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1344FF] ${
                        isActive
                          ? "bg-blue-50 text-[#1344FF]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-[#1344FF]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {recentPlan && !isScheduleEditor ? (
                <button
                  type="button"
                  onClick={continueRecentPlan}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-left transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1344FF]"
                >
                  <History className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="shrink-0 text-sm font-semibold text-slate-700">
                    최근 일정 편집
                  </span>
                  <span className="ml-auto min-w-0 truncate text-xs font-medium text-slate-400">
                    {recentPlan.planName}
                  </span>
                </button>
              ) : null}

              <div className="mt-1 border-t border-slate-100 pt-1.5">
                {isAuthenticated() ? (
                  <>
                    <div className="flex items-center gap-2 px-3 pb-2 pt-1.5 text-[13px] font-extrabold text-slate-900">
                      <User className="h-4 w-4 text-[#1344FF]" />
                      마이페이지
                    </div>
                    <div className="mb-2 ml-5 border-l border-slate-200 pl-2">
                      {MY_PAGE_MENU_ITEMS.map(([section, label]) => (
                        <button
                          key={section}
                          type="button"
                          onClick={() => handleMyPageSectionSelect(section)}
                          className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#1344FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1344FF]"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 pt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        로그아웃
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <LogIn className="h-4 w-4" /> 로그인
                  </button>
                )}
              </div>
            </aside>
          </>
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
    </nav>
  );
}
