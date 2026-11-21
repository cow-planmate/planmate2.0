import { Mail } from 'lucide-react';
import type { ChatPartner } from './ChatModal';

interface MessageTarget {
  userId?: string | null;
  author: string;
  authorImage?: string | null;
  authorAvatarHash?: string | null;
  authorDeleted?: boolean;
}

/** 글·댓글 작성자에게 쪽지 — 로그인했고, 내가 아니고, 탈퇴하지 않은 작성자에게만 보인다 */
export function SendMessageButton({ target, onOpenChat, compact = false }: {
  target: MessageTarget;
  onOpenChat?: (user: ChatPartner) => void;
  compact?: boolean;
}) {
  const { userId } = target;
  if (!onOpenChat || !userId || target.authorDeleted || !localStorage.getItem('accessToken')
    || userId === localStorage.getItem('userId')) return null;

  const open = () => onOpenChat({
    userId,
    nickname: target.author,
    profileImageUrl: target.authorImage ?? null,
    avatarHash: target.authorAvatarHash ?? null,
  });

  return compact ? (
    <button onClick={open} aria-label={`${target.author}님에게 쪽지 보내기`} title="쪽지 보내기" className="text-gray-400 hover:text-[#1344FF] transition-colors">
      <Mail className="h-3.5 w-3.5" />
    </button>
  ) : (
    <button onClick={open} className="flex min-h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-semibold text-[#737986] transition-colors hover:bg-blue-50 hover:text-[#1344FF]">
      <Mail className="h-3.5 w-3.5" />쪽지
    </button>
  );
}
