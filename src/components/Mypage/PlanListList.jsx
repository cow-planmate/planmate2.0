import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { useApiClient } from "../../hooks/useApiClient";
import useConfirmStore from "../../store/Confirm";
import { ErrorToast, SuccessToast } from "../common/Toast";
import PlanActionMenu from "./PlanActionMenu";
import TitleModal from "./TitleModal";
import ShareModal from "../common/ShareModal";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function PlanListList({
  lst,
  onPlanDeleted,
  isOwner,
  onResignEditorSuccess,
  isMultiSelectMode = false,
  isSelected = false,
  onPlanSelect,
  onPlanNameUpdated,
}) {
  const navigate = useNavigate();
  const { del } = useApiClient();
  const { showConfirm } = useConfirmStore();
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const { planId, planName, startDate, endDate, region, duration } = lst;

  const dateLabel =
    startDate && endDate
      ? `${startDate} ~ ${endDate}`
      : duration || "날짜 미설정";

  const handleCardClick = () => {
    if (isMultiSelectMode) {
      onPlanSelect?.(planId, !isSelected);
      return;
    }
    navigate(`/complete?id=${planId}`);
  };

  const handleDelete = async () => {
    const message = isOwner
      ? "이 일정을 삭제하시겠습니까?"
      : "공유된 일정에서 나가시겠습니까?";

    if (!(await showConfirm(message))) return;

    try {
      if (isOwner) {
        await del(`${BASE_URL}/api/plan/${planId}`);
        onPlanDeleted(planId);
        SuccessToast("일정이 삭제되었습니다.");
      } else {
        await del(`${BASE_URL}/api/plan/${planId}/editor/me`);
        onResignEditorSuccess(planId);
        SuccessToast("일정에서 나갔습니다.");
      }
    } catch (err) {
      console.error("일정 삭제 실패:", err);
      ErrorToast("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleResign = async () => {
    if (!(await showConfirm("편집 권한을 포기하시겠습니까?"))) return;

    try {
      await del(`${BASE_URL}/api/plan/${planId}/editor/me`);
      onResignEditorSuccess(planId);
      SuccessToast("편집 권한을 포기했습니다.");
    } catch (err) {
      console.error("편집 권한 포기 실패:", err);
      ErrorToast("편집 권한 포기에 실패했습니다.");
    }
  };

  const handleTitleSuccess = (newTitle) => {
    onPlanNameUpdated?.(planId, newTitle);
    SuccessToast("제목이 변경되었습니다.");
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
          isMultiSelectMode && isSelected
            ? "border-blue-400 bg-blue-50"
            : "border-gray-200 bg-gray-50/50 hover:border-blue-200 hover:bg-blue-50/30"
        }`}
      >
        {isMultiSelectMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onPlanSelect?.(planId, e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 text-blue-600 rounded flex-shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{planName}</h3>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
            {region && (
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3" />
                {region}
              </span>
            )}
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
              {dateLabel}
            </span>
          </div>
        </div>

        {!isMultiSelectMode && (
          <div onClick={(e) => e.stopPropagation()}>
            <PlanActionMenu
              planId={planId}
              isOwner={isOwner}
              onRenameClick={() => setIsTitleModalOpen(true)}
              onDeleteClick={handleDelete}
              onShareClick={() => setIsShareOpen(true)}
              onResignClick={handleResign}
            />
          </div>
        )}
      </div>

      {isTitleModalOpen && (
        <TitleModal
          id={planId}
          currentTitle={planName}
          onClose={() => setIsTitleModalOpen(false)}
          onSuccess={handleTitleSuccess}
        />
      )}

      {isShareOpen && (
        <ShareModal
          setIsShareOpen={setIsShareOpen}
          id={planId}
          isOwner={isOwner}
        />
      )}
    </>
  );
}
