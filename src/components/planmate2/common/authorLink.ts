import React from 'react';

/**
 * 작성자 이름/아바타를 프로필로 이동시키는 클릭 핸들러를 만든다.
 *
 * 탈퇴한 사용자는 이동시키지 않는다 — 프로필 API가 404/403을 주므로 눌러도 빈 화면만 보게 된다.
 * 표시 이름은 서버가 이미 "탈퇴한 사용자"로 내려주므로 여기서 다시 만들지 않는다.
 *
 * @returns onClick이 없으면(=탈퇴) 호출부는 커서·hover 효과도 함께 빼야 한다
 */
export const authorNavProps = (
  author: { userId?: string | null; authorDeleted?: boolean },
  onNavigate?: (view: any, data?: any) => void,
): { onClick?: (e: React.MouseEvent) => void; className: string } => {
  if (author.authorDeleted || !author.userId || !onNavigate) {
    return { className: '' };
  }
  return {
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      onNavigate('mypage', { userId: author.userId });
    },
    className: 'cursor-pointer',
  };
};

/** 탈퇴한 사용자의 이름은 회색으로 죽여서 살아있는 계정과 구분한다 */
export const authorNameClass = (author: { authorDeleted?: boolean }, activeClass: string): string =>
  author.authorDeleted ? 'text-[#999999] italic' : activeClass;
