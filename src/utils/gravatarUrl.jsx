import md5 from "blueimp-md5";

function gravatarUrl(email, size = 80) {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=retro`;
}

export default gravatarUrl;