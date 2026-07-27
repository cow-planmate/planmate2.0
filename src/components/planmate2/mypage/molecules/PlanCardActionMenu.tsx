import { LogOut, MoreVertical, Pencil, Share2, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface PlanCardActionMenuProps {
  planId: string;
  isOwner: boolean;
  onRename: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export const PlanCardActionMenu: React.FC<PlanCardActionMenuProps> = ({
  planId,
  isOwner,
  onRename,
  onShare,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnScroll = () => setIsOpen(false);

    document.addEventListener("mousedown", closeMenu);
    window.addEventListener("scroll", closeOnScroll, true);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      window.removeEventListener("scroll", closeOnScroll, true);
    };
  }, [isOpen]);

  const run = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div
      ref={menuRef}
      className="relative z-30"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label="일정 메뉴 열기"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 z-50 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
          {isOwner && (
            <button
              type="button"
              onClick={() => run(onRename)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
              제목 변경
            </button>
          )}
          <button
            type="button"
            onClick={() => run(() => navigate(`/create?id=${planId}`))}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            일정 수정
          </button>
          <button
            type="button"
            onClick={() => run(onShare)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <Share2 className="h-4 w-4" />
            공유 및 초대
          </button>
          <button
            type="button"
            onClick={() => run(onDelete)}
            className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
          >
            {isOwner ? (
              <Trash2 className="h-4 w-4" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {isOwner ? "일정 삭제" : "공유 일정 나가기"}
          </button>
        </div>
      )}
    </div>
  );
};
