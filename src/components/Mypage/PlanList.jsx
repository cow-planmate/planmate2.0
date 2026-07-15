import MyPlansSection from "./MyPlansSection";
import SharedPlansSection from "./SharedPlansSection";

export default function PlanList({
  myPlans,
  setMyPlans,
  editablePlans,
  setEditablePlans,
}) {
  // 상태 변경 메서드는 공통으로 관리하되 하위 전용 섹션 컴포넌트에 Props 위임
  const removePlanFromState = (planId) => {
    setMyPlans((prevPlans) => prevPlans.filter((p) => p.planId !== planId));
    setEditablePlans((prevPlans) =>
      prevPlans.filter((p) => p.planId !== planId),
    );
  };

  const removeEditablePlanFromState = (planId) => {
    setEditablePlans((prev) => prev.filter((p) => p.planId !== planId));
  };

  const handlePlanNameUpdated = (planId, newTitle) => {
    setMyPlans((prev) =>
      prev.map((p) => (p.planId === planId ? { ...p, planName: newTitle } : p)),
    );
    setEditablePlans((prev) =>
      prev.map((p) => (p.planId === planId ? { ...p, planName: newTitle } : p)),
    );
  };

  return (
    <div className="flex flex-col gap-6 font-pretendard">
      {/* 나의 일정 섹션 (다중 삭제 비즈니스 로직을 완벽히 캡슐화) */}
      <MyPlansSection
        myPlans={myPlans}
        removePlanFromState={removePlanFromState}
        removeEditablePlanFromState={removeEditablePlanFromState}
        onPlanNameUpdated={handlePlanNameUpdated}
      />

      {/* 우리들의 일정 섹션 (초대받은 일정 목록 렌더링 전용) */}
      <SharedPlansSection
        editablePlans={editablePlans}
        removePlanFromState={removePlanFromState}
        removeEditablePlanFromState={removeEditablePlanFromState}
        onPlanNameUpdated={handlePlanNameUpdated}
      />
    </div>
  );
}
