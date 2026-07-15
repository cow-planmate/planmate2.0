import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import PlanListList from "./PlanListList";

export default function SharedPlansSection({
  editablePlans,
  removePlanFromState,
  removeEditablePlanFromState,
  onPlanNameUpdated,
}) {
  return (
    <div className="bg-white w-full rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[28rem]">
      <div className="border-b border-gray-200 px-6 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">우리들의 일정</h2>
          <p className="text-gray-600 mt-1">
            초대받은 일정에서 다른 멤버와 함께 편집하세요
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
          <span>{editablePlans.length}개의 계획</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {editablePlans.length > 0 ? (
          <div className="space-y-4">
            {editablePlans.map((lst) => (
              <PlanListList
                key={lst.planId}
                lst={lst}
                onPlanDeleted={removePlanFromState}
                isOwner={false}
                onResignEditorSuccess={removeEditablePlanFromState}
                onPlanNameUpdated={onPlanNameUpdated}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">편집 권한을 받은 일정이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
