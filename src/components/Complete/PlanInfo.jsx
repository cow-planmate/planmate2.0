import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CalendarDays, Check, Info, MapPin, Pencil, Share2 } from "lucide-react";

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
    <>
      <header className="border-b border-[#ececf0] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#1344FF] sm:flex">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[#1344FF]"><CalendarDays className="h-3.5 w-3.5" /> 완성된 여행 일정</div>
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-xl font-black tracking-[-0.03em] text-[#111318] md:text-2xl">{planFrame.planName}</h1>
              <button type="button" onClick={() => setIsInfoOpen(true)} className="text-[#9aa0ab] transition hover:text-[#1344FF]" aria-label="여행 정보 보기">
                <Info className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={handleEdit} className="flex h-10 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-3 text-sm font-bold text-[#4b5563] transition hover:bg-gray-50 md:px-4">
            <Pencil className="h-4 w-4" /><span className="hidden sm:inline">일정 수정</span>
          </button>
          <button type="button" onClick={() => setIsShareOpen(true)} className="flex h-10 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-3 text-sm font-bold text-[#4b5563] transition hover:bg-gray-50 md:px-4">
            <Share2 className="h-4 w-4" /><span className="hidden sm:inline">공유</span>
          </button>
          <button type="button" onClick={() => navigate("/mypage")} className="flex h-10 items-center gap-2 rounded-xl bg-[#1344FF] px-3 text-sm font-bold text-white transition hover:bg-[#0e35cc] md:px-4">
            <Check className="h-4 w-4" /><span className="hidden sm:inline">확인</span>
          </button>
        </div></div>
      </header>

      {isInfoOpen ? <PlanInfoModal setIsInfoOpen={setIsInfoOpen} planFrame={planFrame} /> : null}
      {isShareOpen ? <ShareModal isOwner={isOwner} setIsShareOpen={setIsShareOpen} id={id} /> : null}
      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onPasswordFindOpen={() => { setIsLoginOpen(false); setIsPasswordFindOpen(true); }} onSignupOpen={() => { setIsLoginOpen(false); setIsSignupOpen(true); }} onLoginSuccess={handleLoginSuccess} />
      <PasswordFind isOpen={isPasswordFindOpen} onClose={() => { setIsPasswordFindOpen(false); setIsLoginOpen(true); }} />
      <Signup isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} onLoginSuccess={handleLoginSuccess} />
    </>
  );
}
