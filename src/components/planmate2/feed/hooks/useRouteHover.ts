import { useCallback, useEffect, useRef, useState } from 'react';

/** 카드에서 팝업으로 마우스가 건너가는 사이(빈 틈)에 닫히지 않도록 두는 유예 */
const CLOSE_DELAY_MS = 140;
/** 터치에서 "길게 누르기"로 볼 시간. 이보다 짧으면 그냥 탭(=상세로 이동)이다 */
const LONG_PRESS_MS = 350;
/** 손가락이 이만큼 움직이면 스크롤로 본다 — 길게 누르기 취소 */
const TOUCH_MOVE_TOLERANCE = 10;

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
  const pressTimer = useRef<number | null>(null);
  const pressStart = useRef<{ x: number; y: number } | null>(null);
  /** 길게 눌러서 팝업을 연 직후의 click 은 상세로 넘어가지 말아야 한다 */
  const suppressClick = useRef(false);

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

  // 터치 기기에는 hover 가 없어 팝업을 볼 방법이 아예 없다 → 길게 누르면 열리게 한다.
  // 탭은 그대로 상세로 이동한다(카드의 onClick).
  const cancelPress = useCallback(() => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    pressStart.current = null;
  }, []);

  // 팝업이 열려 있는 동안 바깥을 터치하면 닫는다.
  // 팝업 안쪽 터치(날짜 넘기기 등)까지 닫아버리면 열어둘 수가 없어 제외한다.
  useEffect(() => {
    if (!anchor) return;
    const onDocTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-route-popover]')) return;
      setAnchor(null);
    };
    document.addEventListener('touchstart', onDocTouch);
    return () => document.removeEventListener('touchstart', onDocTouch);
  }, [anchor]);

  useEffect(() => () => {
    cancelClose();
    cancelPress();
  }, [cancelClose, cancelPress]);

  return {
    anchor,
    cursor,
    /** 카드에 붙일 핸들러 */
    cardProps: {
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => open(e.currentTarget, { x: e.clientX, y: e.clientY }),
      onMouseLeave: scheduleClose,
      onTouchStart: (e: React.TouchEvent<HTMLElement>) => {
        if (!enabled) return;
        const t = e.touches[0];
        if (!t) return;
        const el = e.currentTarget;
        const point = { x: t.clientX, y: t.clientY };
        pressStart.current = point;
        cancelPress();
        pressTimer.current = window.setTimeout(() => {
          suppressClick.current = true;
          open(el, point);
        }, LONG_PRESS_MS);
      },
      onTouchMove: (e: React.TouchEvent<HTMLElement>) => {
        const t = e.touches[0];
        const start = pressStart.current;
        if (!t || !start) return;
        if (Math.abs(t.clientX - start.x) > TOUCH_MOVE_TOLERANCE
          || Math.abs(t.clientY - start.y) > TOUCH_MOVE_TOLERANCE) {
          cancelPress();
        }
      },
      onTouchEnd: cancelPress,
      onTouchCancel: cancelPress,
      onClickCapture: (e: React.MouseEvent<HTMLElement>) => {
        if (!suppressClick.current) return;
        suppressClick.current = false;
        e.preventDefault();
        e.stopPropagation();
      },
    },
    /** 팝업에 붙일 핸들러 */
    popoverProps: {
      onMouseEnter: cancelClose,
      onMouseLeave: scheduleClose,
    },
  };
};
