import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faTrash,
  faPen,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import TitleIcon from "../../assets/imgs/title.svg?react";
import { useNavigate } from "react-router-dom";

export default function PlanActionMenu({
  planId,
  isOwner,
  onRenameClick,
  onDeleteClick,
  onShareClick,
  onResignClick,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const modalWidth = 176;
      const modalHeight = isOwner ? 200 : 250;

      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      let top = buttonRect.bottom + 8;
      if (spaceBelow < modalHeight && spaceAbove > modalHeight) {
        top = buttonRect.top - modalHeight - 8;
      }

      setPosition({
        top: top,
        left: buttonRect.right - modalWidth,
      });
    }
  }, [isOpen, isOwner]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="w-8 h-8 rounded-lg hover:bg-white/80 flex items-center justify-center transition-colors"
      >
        <FontAwesomeIcon
          className="text-gray-500 hover:text-gray-700"
          icon={faEllipsisVertical}
        />
      </button>

      {isOpen && (
        <div
          ref={modalRef}
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
          className="fixed w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRenameClick();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <TitleIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              제목 바꾸기
            </span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/create?id=${planId}`);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <FontAwesomeIcon icon={faPen} className="w-4 h-4 text-black" />
            <span className="text-sm font-medium text-gray-700">수정하기</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-600">삭제하기</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onShareClick();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <FontAwesomeIcon icon={faShare} className="w-4 h-4 text-black" />
            <span className="text-sm font-medium text-gray-700">
              공유 및 초대
            </span>
          </button>

          {!isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResignClick();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
            >
              <FontAwesomeIcon
                icon={faTrash}
                className="w-4 h-4 text-red-500"
              />
              <span className="text-sm font-medium text-red-600">
                편집 권한 포기하기
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
