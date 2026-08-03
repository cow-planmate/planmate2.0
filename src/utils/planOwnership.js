export const resolvePlanOwnership = async ({
  planId,
  planData,
  get,
  baseUrl,
  isAuthenticated,
}) => {
  if (typeof planData?.isOwner === "boolean") {
    return planData.isOwner;
  }

  if (planData?.memberRole) {
    return planData.memberRole === "OWNER";
  }

  if (!planId || !isAuthenticated()) {
    return false;
  }

  try {
    const profile = await get(`${baseUrl}/api/user/profile`);
    return (profile?.myPlans || []).some(
      (plan) => String(plan.planId) === String(planId),
    );
  } catch (error) {
    console.error("일정 소유 여부를 확인하는데 실패했습니다:", error);
    return false;
  }
};
