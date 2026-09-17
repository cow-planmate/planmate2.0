const STORAGE_KEY = "planmate_recent_plan";
const UPDATED_EVENT = "planmate:recent-plan-updated";

const isSafeEditPath = (value) =>
  typeof value === "string" && /^\/create(?:\?id=[^&\s]+)?$/.test(value);

export const getRecentPlan = () => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (!isSafeEditPath(parsed?.path)) return null;

    return {
      path: parsed.path,
      planName:
        typeof parsed.planName === "string" && parsed.planName.trim()
          ? parsed.planName.trim()
          : "최근 여행 일정",
      updatedAt: Number(parsed.updatedAt) || Date.now(),
    };
  } catch (error) {
    console.error("최근 일정 정보를 불러오지 못했습니다.", error);
    return null;
  }
};

export const saveRecentPlan = ({ planId, planName }) => {
  try {
    const normalizedPlanId =
      planId != null && String(planId) !== "" && String(planId) !== "-1"
        ? String(planId)
        : null;
    const recentPlan = {
      path: normalizedPlanId
        ? `/create?id=${encodeURIComponent(normalizedPlanId)}`
        : "/create",
      planName,
      updatedAt: Date.now(),
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(recentPlan));
    window.dispatchEvent(new CustomEvent(UPDATED_EVENT));
  } catch (error) {
    console.error("최근 일정 정보를 저장하지 못했습니다.", error);
  }
};

export const clearRecentPlan = () => {
  sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(UPDATED_EVENT));
};

export const RECENT_PLAN_UPDATED_EVENT = UPDATED_EVENT;
