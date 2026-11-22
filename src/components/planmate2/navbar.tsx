import {
  History,
  LogIn,
  LogOut,
  Menu,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApiClient } from "../../hooks/useApiClient";
import NotificationCenter from "./notifications/NotificationCenter";
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
    navigate(`/mypage?section=${section}`);
  };

  // 인증 관련 상태
  const { isAuthenticated, logout } = useApiClient();
  const { gravatar, nickname, profileImage } = useNicknameStore();
  // 프로필 사진을 올렸으면 그것을, 아니면 이메일 기반 gravatar를 쓴다
  const avatarUrl = profileImage || gravatar;

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

  const handleLogout = async () => {
    clearRecentPlan();
    await logout();
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
                          type="button"
                          onClick={() => {
                            onNavigate("social");
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#1344FF]"
                        >
                          <Users className="h-4 w-4" />
                          소셜
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleLogout();
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
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

          {isAuthenticated() && (
            <NotificationCenter
              onInvitationAccept={onInvitationAccept}
              onOpen={() => {
                setIsProfileMenuOpen(false);
                setIsMobileMenuOpen(false);
              }}
            />
          )}

          {/* 모바일 메뉴 버튼 */}
          <div className={`flex items-center gap-2 md:hidden ${isAuthenticated() ? "" : "ml-auto"}`}>
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
                          onNavigate("social");
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#1344FF]"
                      >
                        <Users className="h-4 w-4" />
                        소셜
                      </button>
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
