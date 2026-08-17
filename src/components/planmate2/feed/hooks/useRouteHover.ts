import { useCallback, useEffect, useRef, useState } from 'react';

/** 카드에서 팝업으로 마우스가 건너가는 사이(빈 틈)에 닫히지 않도록 두는 유예 */
const CLOSE_DELAY_MS = 140;

/**
 * 카드 호버 → 동선 팝업 열기/닫기.
 *
 * 카드와 팝업은 서로 떨어져 있어서, 카드에서 마우스가 나가는 즉시 닫으면
 * 팝업으로 손이 닿기 전에 사라진다. 둘 중 어디든 마우스가 있으면 열어 둔다.
 */
export const useRouteHover = (enabled: boolean) => {
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  /** 카드가 화면 폭을 다 쓰는 리스트에서는 카드 옆이 아니라 커서 옆에 띄운다 */
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const closeTimer = useRef<number | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const open = useCallback((el: HTMLElement, point: { x: number; y: number }) => {
    if (!enabled) return;
    cancelClose();
    setAnchor(el.getBoundingClientRect());
    setCursor(point);
  }, [enabled, cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setAnchor(null), CLOSE_DELAY_MS);
  }, [cancelClose]);

  // 스크롤·리사이즈로 카드가 움직이면 팝업만 제자리에 남아 엉뚱한 카드를 가리키게 된다 → 닫는다
  useEffect(() => {
    if (!anchor) return;
    const close = () => setAnchor(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [anchor]);

  useEffect(() => cancelClose, [cancelClose]);

  return {
    anchor,
    cursor,
    /** 카드에 붙일 핸들러 */
    cardProps: {
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => open(e.currentTarget, { x: e.clientX, y: e.clientY }),
      onMouseLeave: scheduleClose,
    },
    /** 팝업에 붙일 핸들러 */
    popoverProps: {
      onMouseEnter: cancelClose,
      onMouseLeave: scheduleClose,
    },
  };
};
