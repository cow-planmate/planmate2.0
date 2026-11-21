import { useEffect, useRef } from 'react';
import { ModalFrame } from '../planmate2/mypage/molecules/ModalFrame';
import { useSuspensionNotice } from '../../store/SuspensionNotice';

export default function SuspensionNoticeModal() {
  const { isOpen, close } = useSuspensionNotice();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    buttonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, close]);

  return (
    <ModalFrame isOpen={isOpen} onClose={close} title="작성 제한 안내" maxWidth="sm">
      <div role="alertdialog" aria-modal="true" aria-label="작성 제한 안내" className="space-y-5">
        <p className="text-[#666666] leading-relaxed">
          정지 기간에는 커뮤니티와 피드의 글·댓글을 작성할 수 없습니다. 로그인과 조회는 계속 이용할 수 있습니다.
        </p>
        <p className="text-sm text-[#666666] leading-relaxed">
          문의 사항이 있으시면{' '}
          <a href="mailto:planmate@planmate.site" className="font-bold text-[#1344FF] underline underline-offset-2">planmate@planmate.site</a>로 문의해 주세요.
        </p>
        <button ref={buttonRef} type="button" onClick={close} className="w-full py-3 rounded-xl bg-[#1344FF] text-white font-bold hover:bg-[#0d34cc] transition-colors">
          확인
        </button>
      </div>
    </ModalFrame>
  );
}
