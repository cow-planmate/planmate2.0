import { ArrowLeft, Calendar, MapPin, Search, X } from 'lucide-react';
import React from 'react';
import { SchedulePreview } from './SchedulePreview';

interface PlanSelectionModalProps {
  showPlanModal: boolean;
  onClose: () => void;
  planSearch: string;
  setPlanSearch: (val: string) => void;
  loadingPlans: boolean;
  filteredPlans: any[];
  /** 플랜을 고르면 곧바로 넣지 않고 미리보기를 띄운다 */
  onPreviewPlan: (plan: any) => void;
  pendingPlan: any | null;
  loadingPlanPreview: boolean;
  onConfirm: () => void;
  onCancelPreview: () => void;
}

export const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  showPlanModal,
  onClose,
  planSearch,
  setPlanSearch,
  loadingPlans,
  filteredPlans,
  onPreviewPlan,
  pendingPlan,
  loadingPlanPreview,
  onConfirm,
  onCancelPreview,
}) => {
  if (!showPlanModal) return null;

  // 확인 단계 — 어떤 일정이 들어가는지 보여주고 나서 넣는다
  if (pendingPlan) {
    const placeCount = (pendingPlan.schedule ?? []).reduce(
      (sum: number, day: any) => sum + (day.items?.length ?? 0), 0,
    );

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl max-w-3xl w-full p-6 my-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancelPreview}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="플랜 목록으로"
              >
                <ArrowLeft className="w-5 h-5 text-[#666666]" />
              </button>
              <h3 className="text-xl font-bold text-[#1a1a1a]">{pendingPlan.planName}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-[#666666]" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-[#666666] mb-5 pl-1">
            {pendingPlan.destination && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {pendingPlan.destination}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {pendingPlan.duration} · {placeCount}개 장소
            </span>
          </div>

          <div className="max-h-[55vh] overflow-y-auto pr-2 mb-6">
            <SchedulePreview schedule={pendingPlan.schedule ?? []} />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancelPreview}
              className="flex-1 py-3 border border-[#e5e7eb] text-[#666666] rounded-xl hover:bg-gray-50 transition-all font-bold"
            >
              다른 플랜 고르기
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-[2] py-3 bg-[#1344FF] text-white rounded-xl hover:bg-[#0d34cc] transition-all font-bold shadow-lg shadow-blue-100"
            >
              이 일정으로 넣기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#1a1a1a]">내 플랜 선택</h3>
          <button
            type="button"
            onClick={onClose}
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
          {loadingPlans || loadingPlanPreview ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1344FF] mx-auto mb-4"></div>
              <p className="text-gray-500">
                {loadingPlanPreview ? '일정을 불러오는 중...' : '내 플랜을 불러오는 중...'}
              </p>
            </div>
          ) : filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <div
                key={plan.planId || plan.id}
                onClick={() => onPreviewPlan(plan)}
                className="border border-[#e5e7eb] rounded-xl p-4 hover:border-[#1344FF] hover:bg-blue-50 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-[#1a1a1a] mb-1">
                      {plan.planName || plan.title}
                    </h4>
                    {/* v2 목록 응답은 planId/planName만 준다 — 나머지는 있을 때만 노출 */}
                    <div className="flex items-center gap-4 text-sm text-[#666666]">
                      {plan.destination && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {plan.destination}
                        </span>
                      )}
                      {(plan.duration || (plan.startDate && plan.endDate)) && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {plan.duration || `${plan.startDate} ~ ${plan.endDate}`}
                        </span>
                      )}
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
              {planSearch ? '검색 결과가 없습니다.' : '가져올 수 있는 플랜이 없습니다.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
