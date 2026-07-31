import React, { useState } from 'react';
import { gravatarUrlFromHash } from '../../../utils/gravatarUrl';

interface UserAvatarProps {
  /** 이니셜 폴백에 쓰는 닉네임 */
  name?: string | null;
  /** 사용자가 올린 프로필 사진 URL */
  imageUrl?: string | null;
  /** 서버가 내려준 이메일 해시 (Gravatar 식별자) */
  avatarHash?: string | null;
  /** w-8 h-8 처럼 크기를 지정하는 tailwind 클래스 */
  sizeClass: string;
  /** 글자 크기·테두리 등 호출부에서 덧붙이는 클래스 */
  className?: string;
  /** 이니셜 폴백의 배경·글자색을 바꾸고 싶을 때 (기본은 파란 배경 + 흰 글자) */
  fallbackClassName?: string;
  /** 모서리 모양 (기본 원형). rounded-full과 충돌하지 않도록 클래스를 덧붙이지 말고 이 값을 바꾼다 */
  shapeClass?: string;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * 작성자 프로필 아이콘.
 * 프로필 사진 → Gravatar → 닉네임 이니셜 순으로 떨어진다.
 * 이미지 로딩이 실패해도(삭제된 사진, Gravatar 차단 등) 이니셜로 되돌아간다.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  imageUrl,
  avatarHash,
  sizeClass,
  className = '',
  fallbackClassName = 'bg-[#1344FF] text-white',
  shapeClass = 'rounded-full',
  onClick,
}) => {
  const [failed, setFailed] = useState(false);
  const src = imageUrl || (avatarHash ? gravatarUrlFromHash(avatarHash) : null);
  const interactive = onClick ? 'cursor-pointer hover:opacity-80' : '';

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name || '프로필'}
        onClick={onClick}
        onError={() => setFailed(true)}
        className={`${sizeClass} ${shapeClass} object-cover shrink-0 ${interactive} ${className}`}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      className={`${sizeClass} ${shapeClass} ${fallbackClassName} flex items-center justify-center font-bold shrink-0 ${interactive} ${className}`}
    >
      {(name || '?').charAt(0)}
    </div>
  );
};

export default UserAvatar;
