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
          <section><h3 className="font-extrabold text-slate-900">2. 수집하는 개인정보 항목</h3><ul className="mt-1 list-disc pl-5"><li>필수 항목: 이메일, 비밀번호, 닉네임, 생년월일, 성별</li><li>선택 항목: 프로필 이미지</li><li>서비스 이용 과정에서 생성되는 정보: 푸시 알림 발송을 위한 기기 토큰</li><li>SNS 계정 로그인 시: 이메일 주소, 닉네임, 서비스 제공에 필요한 최소한의 계정 식별자 (Google 로그인의 경우, 연동 해제 처리를 위해 암호화하여 보관하는 인증 토큰 포함)</li></ul></section>
          <section><h3 className="font-extrabold text-slate-900">3. 개인정보 보유·이용 기간</h3><ul className="mt-1 list-disc pl-5"><li>회원 탈퇴 시 지체 없이 파기</li><li>단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관</li><li>재해 복구를 위해 별도 보관하는 백업 데이터는 탈퇴 후에도 데이터베이스 백업 최대 28일, 이미지 백업 최대 30일간 남아있을 수 있으며, 해당 기간이 지나면 자동으로 삭제됩니다. 보관 기간 중 백업 데이터는 재해 복구 목적 외에는 사용되지 않습니다.</li></ul></section>
          <section><h3 className="font-extrabold text-slate-900">4. 동의 거부 권리 및 불이익 안내</h3><ul className="mt-1 list-disc pl-5"><li>회원가입 시 필수 항목 동의를 거부할 경우 회원가입이 불가합니다.</li><li>선택 항목은 동의하지 않아도 회원가입은 가능하며, 일부 서비스 이용이 제한될 수 있습니다.</li></ul></section>
          <section><h3 className="font-extrabold text-slate-900">5. SNS 계정 로그인 관련 안내</h3><ul className="mt-1 list-disc pl-5"><li>구글 등 외부 SNS 제공자는 OAuth 인증을 통해 로그인 기능만 제공하며, 회원님의 비밀번호를 당사에 제공하지 않습니다.</li><li>당사는 SNS 제공자로부터 제공받은 최소한의 정보(이메일, 닉네임 등)를 회원 식별 및 서비스 제공 목적에 한정하여 이용합니다.</li><li>SNS 계정 연동 해제 또는 회원 탈퇴 시, 관련 정보는 법령에 따른 보존 의무가 없는 한 지체 없이 파기됩니다.</li></ul></section>
          <section><h3 className="font-extrabold text-slate-900">6. 개인정보의 제3자 제공</h3><ul className="mt-1 list-disc pl-5"><li>당사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.</li></ul></section>
          <section><h3 className="font-extrabold text-slate-900">7. 개인정보 처리업무의 위탁</h3><ul className="mt-1 list-disc pl-5"><li>안정적인 서비스 제공을 위해 아래와 같이 개인정보 처리업무를 위탁하고 있습니다.</li><li>오라클클라우드 — 서버 호스팅(데이터베이스)</li><li>교육기관 서버 제공자 — 서버 호스팅(데이터베이스, 이미지)</li><li>개인 서버 제공자 — 서버 호스팅(데이터베이스, 이미지)</li><li>Vercel Inc. — 프론트엔드(웹사이트) 호스팅</li><li>하이웍스 — 이메일 발송</li><li>Firebase(Google) — 푸시 알림 발송</li><li>위탁계약 체결 시 개인정보보호법 제26조에 따라 위탁업무 수행 목적 외 개인정보 처리 금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 규정하고 있습니다.</li></ul></section>
          <section><h3 className="font-extrabold text-slate-900">8. 개인정보의 국외 이전</h3><ul className="mt-1 list-disc pl-5"><li>당사는 서비스 데이터의 안전한 백업(재해 복구) 목적으로 아래와 같이 개인정보를 국외로 이전하고 있습니다.</li><li>이전받는 자: Google LLC(Google Drive)</li><li>이전되는 개인정보 항목: 2번 항목에 기재된 회원 정보 전체 및 이용자가 등록한 이미지</li><li>이전되는 국가: 미국 등 Google이 서버를 운영하는 국가</li><li>이전 일시 및 방법: 매시간 자동화된 백업 프로세스를 통해 정기적으로 전송</li><li>이전받는 자의 이용 목적 및 보유·이용 기간: 재해 복구 목적, 데이터베이스 백업 최대 28일·이미지 백업 최대 30일 보관 후 자동 삭제</li></ul></section>
          <section><h3 className="font-extrabold text-slate-900">9. 개인정보의 파기 절차 및 방법</h3><ul className="mt-1 list-disc pl-5"><li>이용자의 개인정보는 처리 목적이 달성된 경우 지체 없이 파기합니다.</li><li>전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li><li>단, 재해 복구 목적으로 보관 중인 백업 데이터는 3번 항목에 안내된 보관 기간 동안 남아있을 수 있으며, 해당 기간 경과 후 자동 삭제됩니다.</li></ul></section>
          <section><h3 className="font-extrabold text-slate-900">10. 개인정보의 안전성 확보조치</h3><ul className="mt-1 list-disc pl-5"><li>비밀번호는 복호화가 불가능한 암호화 알고리즘(BCrypt)으로 저장·관리합니다.</li><li>회원 인증 토큰은 비대칭키 서명(RS256) 방식을 사용합니다.</li><li>모든 통신 구간에 암호화 프로토콜(HTTPS)을 적용합니다.</li><li>개인정보 처리시스템에 대한 접근권한을 최소한의 인원으로 제한하여 관리합니다.</li></ul></section>
          <section><h3 className="font-extrabold text-slate-900">11. 쿠키 등 자동수집장치의 설치·운영 및 거부</h3><ul className="mt-1 list-disc pl-5"><li>당사는 로그인 상태 유지를 위한 인증 토큰을 이용자의 브라우저에 저장합니다. 이는 서비스 이용에 필수적인 정보로, 삭제 시 재로그인이 필요할 수 있습니다.</li><li>광고·분석 등 마케팅 목적의 쿠키는 사용하지 않습니다.</li></ul></section>
          <section><h3 className="font-extrabold text-slate-900">12. 정보주체의 권리·의무 및 행사방법</h3><ul className="mt-1 list-disc pl-5"><li>이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지를 요청할 권리를 가집니다.</li><li>닉네임, 생년월일, 성별 등 정보의 정정은 마이페이지에서 직접 처리할 수 있으며, 회원 탈퇴(삭제)는 마이페이지의 탈퇴 기능을 통해 즉시 처리됩니다.</li><li>그 외 열람 및 처리정지 요청은 아래 이메일로 접수하며, 접수 후 지체 없이 처리합니다.</li></ul></section>
          <section><h3 className="font-extrabold text-slate-900">13. 개인정보 보호책임자</h3><ul className="mt-1 list-disc pl-5"><li>직책: 개인정보보호책임자(백엔드 개발팀장 겸임)</li><li>연락처: arlawjdqls012@naver.com</li><li>이용자는 서비스 이용 중 발생한 모든 개인정보 관련 문의를 위 연락처로 하실 수 있습니다.</li></ul></section>
          <p className="rounded-xl bg-slate-50 px-4 py-3 font-semibold text-slate-700">개인정보 관련 문의: <a href="mailto:arlawjdqls012@naver.com" className="text-[#1344FF] underline underline-offset-2">arlawjdqls012@naver.com</a></p>
          <p className="text-xs text-slate-400">이 방침은 시행일로부터 적용되며, 내용 변경 시 본 페이지를 통해 공지합니다.</p>
        </div>

        <footer className="border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="h-11 w-full rounded-xl bg-[#1344FF] text-sm font-extrabold text-white hover:bg-[#0d39df]">확인</button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
