import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
import { useApiClient } from "../../hooks/useApiClient";
import useConfirmStore from "../../store/Confirm";
import { ErrorToast, SuccessToast } from "../common/Toast";
import PlanListList from "./PlanListList";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function MyPlansSection({
  myPlans,
  removePlanFromState,
  removeEditablePlanFromState,
  onPlanNameUpdated,
}) {
  const navigate = useNavigate();
  const { showConfirm } = useConfirmStore();
  const { apiRequest } = useApiClient();

  const [selectedPlans, setSelectedPlans] = useState([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const handlePlanSelect = (planId, isSelected) => {
    if (isSelected) {
      setSelectedPlans((prev) => [...prev, planId]);
    } else {
      setSelectedPlans((prev) => prev.filter((id) => id !== planId));
    }
  };

  const handleSelectAll = () => {
    if (selectedPlans.length === myPlans.length) {
      setSelectedPlans([]);
    } else {
      setSelectedPlans(myPlans.map((plan) => plan.planId));
    }
  };

  const handleMultipleDelete = async () => {
    if (selectedPlans.length === 0) return;

    if (
      await showConfirm(
        `선택한 ${selectedPlans.length}개의 일정을 삭제하시겠습니까?`,
      )
    ) {
      try {
        await apiRequest(`${BASE_URL}/api/plan`, {
          method: "DELETE",
          body: JSON.stringify({
            planIds: selectedPlans,
          }),
        });

        selectedPlans.forEach((planId) => {
          removePlanFromState(planId);
        });

        setSelectedPlans([]);
        setIsMultiSelectMode(false);
        SuccessToast("선택한 일정들이 삭제되었습니다.");
      } catch (err) {
        console.error("일괄삭제 실패:", err);
        ErrorToast("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="bg-white w-full rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[28rem]">
      <div className="border-b border-gray-200 px-6 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">나의 일정</h2>
          <p className="text-gray-600 mt-1">직접 생성한 일정을 관리하세요</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
            <span>{myPlans.length}개의 계획</span>
          </div>
          {myPlans.length > 0 && (
            <button
              onClick={() => {
                setIsMultiSelectMode(!isMultiSelectMode);
                setSelectedPlans([]);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isMultiSelectMode
                  ? "bg-gray-200 text-gray-700"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              }`}
            >
              {isMultiSelectMode ? "취소" : "다중삭제"}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {isMultiSelectMode && myPlans.length > 0 && (
          <div className="flex-shrink-0 mx-6 mt-6 mb-4 flex items-center justify-between bg-blue-50 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedPlans.length === myPlans.length &&
                    myPlans.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  전체 선택
                </span>
              </label>
              <span className="text-sm text-gray-600">
                {selectedPlans.length}개 선택됨
              </span>
            </div>
            <button
              onClick={handleMultipleDelete}
              disabled={selectedPlans.length === 0}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              선택 삭제 ({selectedPlans.length})
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {myPlans.length > 0 ? (
            <div className="space-y-4">
              {myPlans.map((lst) => (
                <PlanListList
                  key={lst.planId}
                  lst={lst}
                  onPlanDeleted={removePlanFromState}
                  isOwner={true}
                  onResignEditorSuccess={removeEditablePlanFromState}
                  isMultiSelectMode={isMultiSelectMode}
                  isSelected={selectedPlans.includes(lst.planId)}
                  onPlanSelect={handlePlanSelect}
                  onPlanNameUpdated={onPlanNameUpdated}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FontAwesomeIcon
                  icon={faCalendarPlus}
                  className="w-6 h-6 text-gray-400"
                />
              </div>
              <p className="text-gray-500 mb-4">생성한 일정이 없습니다</p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-main hover:bg-blue-900 text-white font-medium rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faCalendarPlus} className="w-4 h-4" />
                여행 계획 만들기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
