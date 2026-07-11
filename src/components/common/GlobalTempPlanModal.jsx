import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getTempPlan, clearTempPlan } from "../../utils/tempPlanStorage";

export default function GlobalTempPlanModal() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // 1. Check if we are on the Create page (don't show global modal there)
        if (location.pathname === "/create") {
            setIsOpen(false);
            return;
        }

        // 2. Check if already shown in this session
        const hasShown = sessionStorage.getItem("tempPlanPromptShown");
        if (hasShown) {
            return;
        }

        // 3. Check if temp plan exists
        const temp = getTempPlan();
        // Check if temp plan has valid data (planId can be -1 for new plans)
        if (temp && temp.plan) {
            setIsOpen(true);
            // Mark as shown immediately so it doesn't pop up again on refresh/navigation
            sessionStorage.setItem("tempPlanPromptShown", "true");
        }
    }, [location.pathname]);

    const loadTempPlan = () => {
        setIsOpen(false);
        navigate("/create", { state: { loadTemp: true } });
    };

    const discardTempPlan = () => {
        clearTempPlan();
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h3 className="text-lg font-bold mb-4 font-pretendard">임시 저장된 일정</h3>
                <p className="text-gray-600 mb-6 font-pretendard">
                    이전에 작성하던 일정이 있습니다.<br />
                    불러오시겠습니까?
                </p>
                <div className="flex gap-3 font-pretendard">
                    <button
                        onClick={discardTempPlan}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                        버리기
                    </button>
                    <button
                        onClick={loadTempPlan}
                        className="flex-1 px-4 py-2 bg-main text-white rounded hover:bg-mainDark"
                    >
                        불러오기
                    </button>
                </div>
            </div>
        </div>
    );
}
