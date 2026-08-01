import md5 from "blueimp-md5";

function gravatarUrl(email, size = 80) {
  return gravatarUrlFromHash(md5(email.trim().toLowerCase()), size);
}

/**
 * 이메일 대신 서버가 계산해준 해시로 Gravatar URL을 만든다.
 * 타인(게시글·댓글 작성자)의 이메일은 클라이언트로 내려오지 않으므로,
 * 커뮤니티 응답의 authorAvatarHash에는 이 함수를 쓴다.
 */
export function gravatarUrlFromHash(hash, size = 80) {
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=retro`;
}

export default gravatarUrl;
