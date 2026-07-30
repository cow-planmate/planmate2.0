import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { LogOut, MoreVertical, Pencil, Share2, Trash2 } from "lucide-react";
import React, { useState } from "react";
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
  const navigate = useNavigate();

  const run = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div
      className="relative z-30"
      onClick={(event) => event.stopPropagation()}
    >
      <DropdownMenuPrimitive.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        modal={false}
      >
        <DropdownMenuPrimitive.Trigger asChild>
          <button
            type="button"
            aria-label="일정 메뉴 열기"
            onPointerDown={(event) => event.stopPropagation()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="end"
            sideOffset={4}
            collisionPadding={12}
            onCloseAutoFocus={(event) => event.preventDefault()}
            className="z-50 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl"
          >
          {isOwner && (
            <DropdownMenuPrimitive.Item
              onSelect={() => run(onRename)}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 outline-none hover:bg-gray-50 focus:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
              제목 변경
            </DropdownMenuPrimitive.Item>
          )}
          <DropdownMenuPrimitive.Item
            onSelect={() => run(() => navigate(`/create?id=${planId}`))}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 outline-none hover:bg-gray-50 focus:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            일정 수정
          </DropdownMenuPrimitive.Item>
          <DropdownMenuPrimitive.Item
            onSelect={() => run(onShare)}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 outline-none hover:bg-gray-50 focus:bg-gray-50"
          >
            <Share2 className="h-4 w-4" />
            공유 및 초대
          </DropdownMenuPrimitive.Item>
          <DropdownMenuPrimitive.Item
            onSelect={() => run(onDelete)}
            className="flex w-full cursor-pointer items-center gap-3 border-t border-gray-100 px-4 py-2.5 text-left text-sm text-red-600 outline-none hover:bg-red-50 focus:bg-red-50"
          >
            {isOwner ? (
              <Trash2 className="h-4 w-4" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {isOwner ? "일정 삭제" : "공유 일정 나가기"}
          </DropdownMenuPrimitive.Item>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </div>
  );
};
