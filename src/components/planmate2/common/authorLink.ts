/**
 * 작성자 이름과 아바타는 표시만 하고 타인 마이페이지로 이동시키지 않는다.
 */
export const authorNavProps = (
  _author: { userId?: string | null; authorDeleted?: boolean },
  _onNavigate?: (view: any, data?: any) => void,
): { onClick?: never; className: string } => ({ className: '' });

/** 탈퇴한 사용자의 이름은 회색으로 죽여서 살아있는 계정과 구분한다 */
export const authorNameClass = (author: { authorDeleted?: boolean }, activeClass: string): string =>
  author.authorDeleted ? 'text-[#999999] italic' : activeClass;
