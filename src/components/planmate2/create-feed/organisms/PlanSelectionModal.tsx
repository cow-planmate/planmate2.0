import { Calendar, MapPin, Search, X } from 'lucide-react';
import React from 'react';

interface PlanSelectionModalProps {
  showPlanModal: boolean;
  setShowPlanModal: (val: boolean) => void;
  planSearch: string;
  setPlanSearch: (val: string) => void;
  loadingPlans: boolean;
  filteredPlans: any[];
  handlePlanSelect: (plan: any) => void;
}

export const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  showPlanModal,
  setShowPlanModal,
  planSearch,
  setPlanSearch,
  loadingPlans,
  filteredPlans,
  handlePlanSelect,
}) => {
  if (!showPlanModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#1a1a1a]">내 플랜 선택</h3>
          <button
            type="button"
            onClick={() => setShowPlanModal(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-[#666666]" />
          </button>
        </div>

        {/* 검색바 */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={planSearch}
            onChange={(e) => setPlanSearch(e.target.value)}
            placeholder="플랜 이름 또는 목적지 검색..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1344FF] transition-all"
          />
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {loadingPlans ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1344FF] mx-auto mb-4"></div>
              <p className="text-gray-500">내 플랜을 불러오는 중...</p>
            </div>
          ) : filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <div
                key={plan.planId || plan.id}
                onClick={() => handlePlanSelect(plan)}
                className="border border-[#e5e7eb] rounded-xl p-4 hover:border-[#1344FF] hover:bg-blue-50 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-[#1a1a1a] mb-1">
                      {plan.planName || plan.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-[#666666]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {plan.destination || '여행지'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {plan.duration || `${plan.startDate} ~ ${plan.endDate}`}
                      </span>
                    </div>
                  </div>
                  {plan.startDate && (
                    <span className="text-sm text-[#1344FF] font-medium">
                      {plan.startDate} ~ {plan.endDate}
                    </span>
                  )}
                </div>
                {(plan.schedule || plan.planId) && (
                  <div className="text-sm text-[#666666]">
                    {plan.schedule 
                      ? `총 ${plan.schedule.length}일 일정 · ${plan.schedule.reduce((sum: number, day: any) => sum + day.items.length, 0)}개 장소`
                      : "플랜 상세 정보 포함"}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
