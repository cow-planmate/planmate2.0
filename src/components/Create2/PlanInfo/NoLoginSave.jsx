import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingRing from "../../../assets/imgs/ring-resize.svg?react";
import { useApiClient } from "../../../hooks/useApiClient";
import usePlanStore from "../../../store/Plan";
import useItemsStore from "../../../store/Schedules";
import useTimetableStore from "../../../store/Timetables";
import { exportBlock } from "../../../utils/createUtils";
import { clearTempPlan } from "../../../utils/tempPlanStorage";

export default function NoLoginSave({ isOpen }) {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { isAuthenticated, post } = useApiClient();
  const {
    planName, departure, transportationCategoryId, travelId, adultCount, childCount,
  } = usePlanStore();
  const { timetables } = useTimetableStore();
  const { items } = useItemsStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    const exportBlocks = Object.entries(items).flatMap(([key, day]) => {
      if (!Array.isArray(day)) return [];
      const date = timetables.find((t) => t.timeTableId === Number(key))?.date;
      console.log(date);
      return day.map(item =>
        exportBlock(key, item.place, item.start, item.duration, item.id, true, date, item.memo)
      )
    });

    const savePlan = async () => {
      if (isAuthenticated()) {
        try {
          const res = await post(`${BASE_URL}/api/plan/create`, {
            planFrame: {
              planName: planName,
              departure: departure,
              transportationCategoryId: transportationCategoryId,
              travelId: travelId,
              adultCount: adultCount,
              childCount: childCount,
            },
            timetables: timetables,
            timetablePlaceBlocks: exportBlocks
          });
          clearTempPlan();
          console.log(res.message);
          navigate(`/complete?id=${res.planId}`);
        } catch (err) {
          console.error("요청에 실패했습니다.", err);
        }
      }
    }

    savePlan();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm font-pretendard">
      <div className="flex flex-col items-center space-y-3">
        <LoadingRing className="w-20" />
      </div>
    </div>
  )
}