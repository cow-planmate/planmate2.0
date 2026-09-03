import {
  CalendarDays,
  Calendar as CalendarIcon,
  Check,
  CheckSquare,
  Settings,
  Square,
  Trash2,
  TrendingUp,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { PlanCardActionMenu } from "../molecules/PlanCardActionMenu";
import { getPlanStatusLabel } from "../../../../utils/planSchedule";
import { ChecklistSheet } from "../../../checklist/ChecklistSheet";

/** 진행 중 + 예정을 하나로 묶었으므로 탭은 PlanStatus가 아닌 2종이다 */
type TripTab = "upcoming" | "past";

// 카드에 실린 status 라벨은 getPlanStatusLabel이 만든 값이라 이 상수와 항상 같다
const isOngoing = (trip: any) => trip.status === getPlanStatusLabel("ongoing");

interface TripSectionProps {
  isDeleteMode: boolean;
  setIsDeleteMode: (mode: boolean) => void;
  selectedPlanIds: string[];
  /** 현재 탭에 보이는 일정만 전체 선택 대상이 된다 */
  toggleSelectAll: (visiblePlans: any[]) => void;
  togglePlanSelection: (id: string) => void;
  handleBulkDelete: () => void;
  allPlans: any[];
  ongoingPlans: any[];
  upcomingPlans: any[];
  pastPlans: any[];
  onNavigateTrip: (id: string) => void;
  handleDeletePlan: (id: string, isOwner: boolean) => void;
  onRenamePlan: (plan: any) => void;
  onSharePlan: (plan: any) => void;
  onNavigateToPlanMaker: () => void;
  showChecklists?: boolean;
}

export const TripSection: React.FC<TripSectionProps> = ({
  isDeleteMode,
  setIsDeleteMode,
  selectedPlanIds,
  toggleSelectAll,
  togglePlanSelection,
  handleBulkDelete,
  allPlans,
  ongoingPlans,
  upcomingPlans,
  pastPlans,
  onNavigateTrip,
  handleDeletePlan,
  onRenamePlan,
  onSharePlan,
  onNavigateToPlanMaker,
  showChecklists = true,
}) => {
  // 진행 중과 예정을 한 탭으로 묶는다 — 사용자 입장에서 둘 다 "아직 안 끝난 여행"이고,
  // 진행 중 여부는 카드의 '진행 중' 배지(trip.status)로 이미 구분된다.
  const [activeTab, setActiveTab] = useState<TripTab>("upcoming");

  // 진행 중인 여행을 항상 위로 (그 안에서는 원래 순서 유지)
  const scheduledPlans = useMemo(
    () => [...ongoingPlans, ...upcomingPlans],
    [ongoingPlans, upcomingPlans],
  );

  const visiblePlans = activeTab === "upcoming" ? scheduledPlans : pastPlans;

  const isAllVisibleSelected =
    visiblePlans.length > 0 &&
    visiblePlans.every((plan) => selectedPlanIds.includes(plan.id));

  const TABS: { key: TripTab; label: string; count: number }[] = [
    { key: "upcoming", label: "예정된 일정", count: scheduledPlans.length },
    { key: "past", label: "지난 일정", count: pastPlans.length },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#1344FF]"><CalendarDays className="h-5 w-5" /></span>
          <div><p className="text-[10px] font-black tracking-[0.12em] text-[#1344FF]">ITINERARY</p><h3 className="mt-0.5 text-xl font-black tracking-[-0.03em] text-slate-950 whitespace-nowrap">여행 타임라인</h3></div>
        </div>

        {/* 삭제 모드에서는 버튼이 3개로 늘어 모바일 폭을 넘긴다 — 줄바꿈을 허용한다 */}
        <div className="flex flex-wrap items-center gap-2">
          {isDeleteMode ? (
            <>
              <button
                onClick={() => toggleSelectAll(visiblePlans)}
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                {isAllVisibleSelected ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                전체 선택
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                선택 삭제 ({selectedPlanIds.length})
              </button>
              <button
                onClick={() => {
                  setIsDeleteMode(false);
                  togglePlanSelection("");
                }}
                className="px-3 py-1.5 whitespace-nowrap text-gray-500 text-sm font-medium hover:underline"
              >
                취소
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsDeleteMode(true)}
              className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <Settings className="w-4 h-4" />
              일정 관리
            </button>
          )}
        </div>
      </div>

      {/* 여행이 쌓이면 세로로 계속 길어지므로 시점별 탭으로 나눈다 */}
      <div className="mb-7 flex w-fit items-center gap-1 rounded-xl bg-slate-100 p-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative rounded-lg px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 text-xs ${activeTab === tab.key ? "text-[#1344FF]" : "text-gray-300"}`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {activeTab === "upcoming" && scheduledPlans.length > 0 && (
          <div className="rounded-xl bg-[#f8f9fa] p-4 sm:p-6">
            <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1a1a1a]">
              <CalendarDays className="w-5 h-5 text-gray-400" />
              예정된 여행
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {scheduledPlans.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => !isDeleteMode && onNavigateTrip(trip.id)}
                  // 진행 중인 여행은 테두리를 진하게 줘서 예정된 여행과 한눈에 구분되게 한다
                  className={`relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 transition-colors ${isDeleteMode ? "cursor-default ring-2 ring-[#1344FF]" : "cursor-pointer hover:border-[#1344FF]/25"}`}
                >
                  {isDeleteMode && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlanSelection(trip.id);
                      }}
                      className="absolute right-5 top-5 z-20 cursor-pointer"
                    >
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedPlanIds.includes(trip.id) ? "bg-[#1344FF] border-[#1344FF] text-white" : "bg-white border-gray-300"}`}
                      >
                        {selectedPlanIds.includes(trip.id) && (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <span
                            className={`flex h-2.5 w-2.5 rounded-full ${trip.isOwner ? "bg-[#1344FF]" : "bg-orange-500"}`}
                          />
                          <span
                            className={`shrink-0 whitespace-nowrap text-[10px] font-black tracking-wider ${trip.isOwner ? "text-[#1344FF]" : "text-orange-500"}`}
                          >
                            {trip.isOwner ? "나의 일정" : "공유된 일정"}
                          </span>
                          <span
                            className={`shrink-0 whitespace-nowrap px-2 py-1 ${trip.theme === "blue" ? "bg-[#1344FF]" : "bg-orange-500"} text-white text-[10px] font-black rounded shadow-sm`}
                          >
                            {trip.dDay}
                          </span>
                          {/* 진행 중인 여행만 강조 — 두 탭을 합친 뒤 이 배지가 유일한 구분 표시다 */}
                          <span
                            className={
                              isOngoing(trip)
                                ? "flex shrink-0 items-center gap-1 whitespace-nowrap px-2 py-1 bg-[#1344FF]/10 text-[#1344FF] text-[10px] font-black rounded"
                                : "shrink-0 whitespace-nowrap text-gray-400 text-[10px] font-black uppercase tracking-wider"
                            }
                          >
                            {isOngoing(trip) && (
                              <TrendingUp className="w-3 h-3 animate-pulse" />
                            )}
                            {trip.status}
                          </span>
                        </div>
                        {!isDeleteMode && (
                          <PlanCardActionMenu
                            planId={trip.id}
                            isOwner={trip.isOwner}
                            onRename={() => onRenamePlan(trip)}
                            onShare={() => onSharePlan(trip)}
                            onDelete={() =>
                              handleDeletePlan(trip.id, trip.isOwner)
                            }
                          />
                        )}
                      </div>

                      <div className="text-left mt-1">
                        <h4 className="text-xl font-black text-[#1a1a1a] mb-1.5 truncate leading-tight">
                          {trip.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-[#666666]">
                          <CalendarIcon className="w-4 h-4 shrink-0 opacity-40" />
                          <p className="text-sm font-bold whitespace-nowrap">{trip.dateStr}</p>
                        </div>
                      </div>
                    </div>

                    {showChecklists ? (
                      <ChecklistSheet planId={trip.id} variant="summary" />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "upcoming" && scheduledPlans.length === 0 && (
          <div className="py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              다음 여행을 계획해보세요.
            </p>
            <button
              onClick={onNavigateToPlanMaker}
              className="mt-4 text-[#1344FF] font-bold hover:underline"
            >
              새로운 여행 계획하기
            </button>
          </div>
        )}

        {activeTab === "past" && (
        <div className="bg-[#f8f9fa] rounded-xl p-4 sm:p-6">
          <h4 className="text-lg font-bold text-[#1a1a1a] mb-4">
            지난 여행 기록
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pastPlans.length > 0 ? (
              pastPlans.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => {
                    if (isDeleteMode) {
                      togglePlanSelection(trip.id);
                    } else {
                      onNavigateTrip(trip.id);
                    }
                  }}
                  className={`bg-white rounded-xl p-4 hover:shadow-md transition-all border border-gray-100 relative group ${isDeleteMode ? "cursor-default ring-1 " + (selectedPlanIds.includes(trip.id) ? "ring-[#1344FF] bg-blue-50/30" : "ring-transparent") : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      {isDeleteMode ? (
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedPlanIds.includes(trip.id) ? "bg-[#1344FF] border-[#1344FF] text-white" : "bg-white border-gray-300"}`}
                        >
                          {selectedPlanIds.includes(trip.id) && (
                            <Check className="w-3 h-3" />
                          )}
                        </div>
                      ) : (
                        <span className="shrink-0 whitespace-nowrap px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                          완료
                        </span>
                      )}
                      <span
                        className={`flex shrink-0 items-center gap-1 whitespace-nowrap text-[10px] font-bold ${trip.isOwner ? "text-[#1344FF]" : "text-orange-500"}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${trip.isOwner ? "bg-[#1344FF]" : "bg-orange-500"}`}
                        />
                        {trip.isOwner ? "나의 일정" : "공유된 일정"}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!isDeleteMode && (
                        <PlanCardActionMenu
                          planId={trip.id}
                          isOwner={trip.isOwner}
                          onRename={() => onRenamePlan(trip)}
                          onShare={() => onSharePlan(trip)}
                          onDelete={() =>
                            handleDeletePlan(trip.id, trip.isOwner)
                          }
                        />
                      )}
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <h5 className="font-bold text-[#1a1a1a] mb-1 truncate text-left">
                    {trip.title}
                  </h5>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs text-[#666666] whitespace-nowrap">{trip.dateStr}</p>
                    {trip.duration && (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 whitespace-nowrap">
                        {trip.duration}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400 py-8 text-sm">
                아직 다녀온 여행이 없어요.
              </p>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
