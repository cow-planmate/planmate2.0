import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-policy-title"
        className="relative flex max-h-[86dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 id="privacy-policy-title" className="text-xl font-black text-slate-950">
              개인정보 처리방침
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-400">시행일: 2026년 9월 20일</p>
          </div>
          <button type="button" onClick={onClose} aria-label="개인정보 처리방침 닫기" className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-5 overflow-y-auto px-6 py-5 text-sm leading-6 text-slate-600">
          <section><h3 className="font-extrabold text-slate-900">1. 수집·이용 목적</h3><ul className="mt-1 list-disc pl-5"><li>회원 관리 및 서비스 제공</li><li>문의 대응 및 공지사항 전달</li><li>맞춤형 서비스 제공 및 이벤트 안내</li></ul></section>
          <section><h3 className="font-extrabold text-slate-900">2. 수집하는 개인정보 항목</h3><ul className="mt-1 list-disc pl-5"><li>필수 항목: 이메일, 비밀번호, 닉네임, 나이, 성별</li><li>SNS 계정 로그인 시: 이메일 주소, 프로필 정보(닉네임, 프로필 이미지 등) 및 서비스 제공에 필요한 최소한의 계정 식별자</li></ul></section>
          <section><h3 className="font-extrabold text-slate-900">3. 개인정보 보유·이용 기간</h3><ul className="mt-1 list-disc pl-5"><li>회원 탈퇴 시 지체 없이 파기</li><li>단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관</li></ul></section>
          <section><h3 className="font-extrabold text-slate-900">4. 동의 거부 권리 및 불이익 안내</h3><ul className="mt-1 list-disc pl-5"><li>회원가입 시 필수 항목 동의를 거부할 경우 회원가입이 불가합니다.</li><li>선택 항목은 동의하지 않아도 회원가입은 가능하며, 일부 서비스 이용이 제한될 수 있습니다.</li></ul></section>
          <section><h3 className="font-extrabold text-slate-900">5. SNS 계정 로그인 관련 안내</h3><ul className="mt-1 list-disc pl-5"><li>구글 등 외부 SNS 제공자는 OAuth 인증을 통해 로그인 기능만 제공하며, 회원님의 비밀번호를 당사에 제공하지 않습니다.</li><li>당사는 SNS 제공자로부터 제공받은 최소한의 정보(이메일, 프로필 정보 등)를 회원 식별 및 서비스 제공 목적에 한정하여 이용합니다.</li><li>SNS 계정 연동 해제 또는 회원 탈퇴 시, 관련 정보는 법령에 따른 보존 의무가 없는 한 지체 없이 파기됩니다.</li></ul></section>
          <p className="rounded-xl bg-slate-50 px-4 py-3 font-semibold text-slate-700">개인정보 관련 문의: <a href="mailto:arlawjdqls012@naver.com" className="text-[#1344FF] underline underline-offset-2">arlawjdqls012@naver.com</a></p>
        </div>

        <footer className="border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="h-11 w-full rounded-xl bg-[#1344FF] text-sm font-extrabold text-white hover:bg-[#0d39df]">확인</button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
