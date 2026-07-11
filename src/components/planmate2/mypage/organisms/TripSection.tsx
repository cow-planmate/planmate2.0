import { CalendarDays, Calendar as CalendarIcon, Check, CheckSquare, Plus, Settings, Square, Trash2, TrendingUp, Users, X } from 'lucide-react';
import React from 'react';

interface TripSectionProps {
  isDeleteMode: boolean;
  setIsDeleteMode: (mode: boolean) => void;
  selectedPlanIds: number[];
  toggleSelectAll: () => void;
  togglePlanSelection: (id: number) => void;
  handleBulkDelete: () => void;
  allPlans: any[];
  ongoingPlans: any[];
  upcomingPlans: any[];
  pastPlans: any[];
  onNavigateTrip: (id: number) => void;
  handleDeletePlan: (id: number, isOwner: boolean) => void;
  handleToggleChecklist: (planId: number, itemId: number) => void;
  handleUpdateChecklistText: (planId: number, itemId: number, text: string) => void;
  handleDeleteChecklistItem: (planId: number, itemId: number) => void;
  handleAddChecklistItem: (planId: number) => void;
  onNavigateToPlanMaker: () => void;
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
  handleToggleChecklist,
  handleUpdateChecklistText,
  handleDeleteChecklistItem,
  handleAddChecklistItem,
  onNavigateToPlanMaker,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-[#1344FF]" />
          <h3 className="text-xl font-bold text-[#1a1a1a]">여행 상세 일정</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {isDeleteMode ? (
            <>
              <button 
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                {selectedPlanIds.length === allPlans.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                전체 선택
              </button>
              <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                선택 삭제 ({selectedPlanIds.length})
              </button>
              <button 
                onClick={() => {
                  setIsDeleteMode(false);
                  togglePlanSelection(-1); // Reset selected IDs logic or just call a reset
                }}
                className="px-3 py-1.5 text-gray-500 text-sm font-medium hover:underline"
              >
                취소
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsDeleteMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <Settings className="w-4 h-4" />
              일정 관리
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {ongoingPlans.length > 0 && (
          <div className="space-y-4 pb-2">
            <h4 className="text-lg font-bold text-[#1344FF] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 animate-pulse" />
              진행 중인 여행
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ongoingPlans.map((trip) => (
                <div 
                  key={trip.id} 
                  onClick={() => !isDeleteMode && onNavigateTrip(trip.id)}
                  className={`bg-white rounded-xl p-5 border-2 border-[#1344FF]/20 relative overflow-hidden group transition-all shadow-sm ${isDeleteMode ? 'cursor-default ring-2 ring-offset-2 ' + (selectedPlanIds.includes(trip.id) ? 'ring-white' : 'ring-transparent') : 'cursor-pointer hover:shadow-md hover:-translate-y-1'}`}
                >
                  {isDeleteMode && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlanSelection(trip.id);
                      }}
                      className="absolute top-3 left-3 z-20 cursor-pointer"
                    >
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedPlanIds.includes(trip.id) ? 'bg-[#1344FF] border-[#1344FF] text-white' : 'bg-transparent border-gray-300'}`}>
                        {selectedPlanIds.includes(trip.id) && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[#1344FF] text-xs font-black tracking-widest">ON AIR</span>
                        </div>
                        {!isDeleteMode && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlan(trip.id, trip.isOwner);
                            }}
                            className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="text-left">
                        <h4 className="text-xl font-black text-[#1a1a1a] mb-1 tracking-tight truncate">{trip.title}</h4>
                        <div className="flex items-center gap-2 text-gray-400">
                          <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                          <p className="text-sm font-bold">{trip.dateStr}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-blue-100/30 flex flex-col">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[10px] font-black text-[#1344FF] uppercase tracking-widest opacity-60">Check List</span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {trip.checklist.filter((i: any) => i.done).length}/{trip.checklist.length}
                        </span>
                      </div>
                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                        {trip.checklist.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-2.5 group/checkItem">
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleChecklist(trip.id, item.id);
                              }}
                              className={`w-4 h-4 rounded-md flex-shrink-0 border-2 transition-all flex items-center justify-center cursor-pointer ${item.done ? 'bg-[#1344FF] border-[#1344FF]' : 'border-gray-200 bg-white hover:border-[#1344FF]/30'}`}
                            >
                              {item.done && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <input 
                              type="text"
                              value={item.text}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleUpdateChecklistText(trip.id, item.id, e.target.value)}
                              className={`flex-1 bg-transparent text-xs font-bold outline-none border-b border-transparent focus:border-[#1344FF]/20 transition-all py-0.5 ${item.done ? 'text-gray-300 line-through' : 'text-gray-600'}`}
                            />
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChecklistItem(trip.id, item.id);
                              }}
                              className="opacity-0 group-hover/checkItem:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddChecklistItem(trip.id);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 mt-4 border border-dashed border-gray-200 rounded-xl text-[11px] font-bold text-gray-400 hover:text-[#1344FF] hover:border-[#1344FF]/30 hover:bg-white transition-all shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                        할 일 추가
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingPlans.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-[#1a1a1a] flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-gray-400" />
              예정된 여행
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingPlans.map((trip) => (
                <div 
                  key={trip.id} 
                  onClick={() => !isDeleteMode && onNavigateTrip(trip.id)}
                  className={`bg-white rounded-xl p-5 border-2 relative overflow-hidden group transition-all shadow-sm ${trip.theme === 'blue' ? 'border-blue-50 hover:border-blue-200' : 'border-orange-50 hover:border-orange-200'} ${isDeleteMode ? 'cursor-default ring-2 ring-offset-2 ' + (selectedPlanIds.includes(trip.id) ? 'ring-[#1344FF]' : 'ring-transparent') : 'cursor-pointer hover:shadow-md hover:-translate-y-1'}`}
                >
                  {!trip.isOwner && (
                    <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold flex items-center gap-1.5 shadow-sm z-10">
                      <Users className="w-3.5 h-3.5" />
                      SHARED
                    </div>
                  )}

                  {isDeleteMode && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlanSelection(trip.id);
                      }}
                      className="absolute top-3 left-3 z-20 cursor-pointer"
                    >
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedPlanIds.includes(trip.id) ? 'bg-[#1344FF] border-[#1344FF] text-white' : 'bg-white border-gray-300'}`}>
                        {selectedPlanIds.includes(trip.id) && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 ${trip.theme === 'blue' ? 'bg-[#1344FF]' : 'bg-orange-500'} text-white text-[10px] font-black rounded shadow-sm`}>
                            {trip.dDay}
                          </span>
                          <span className="text-gray-400 text-[10px] font-black uppercase tracking-wider">
                            {trip.status}
                          </span>
                        </div>
                        {!isDeleteMode && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlan(trip.id, trip.isOwner);
                            }}
                            className="p-1 px-1.5 text-gray-200 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-all"
                            title={trip.isOwner ? "삭제" : "나가기"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="text-left mt-1">
                        <h4 className="text-xl font-black text-[#1a1a1a] mb-1.5 truncate leading-tight">{trip.title}</h4>
                        <div className="flex items-center gap-2 text-[#666666]">
                          <CalendarIcon className="w-4 h-4 opacity-40" />
                          <p className="text-sm font-bold">{trip.dateStr}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50 flex flex-col">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Check List</span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {trip.checklist.filter((i: any) => i.done).length}/{trip.checklist.length}
                        </span>
                      </div>
                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                        {trip.checklist.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-2.5 group/prepItem">
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleChecklist(trip.id, item.id);
                              }}
                              className={`w-4 h-4 rounded-md flex-shrink-0 border-2 transition-all flex items-center justify-center cursor-pointer ${item.done ? (trip.theme === 'blue' ? 'bg-[#1344FF] border-[#1344FF]' : 'bg-orange-500 border-orange-500') : 'bg-white border-gray-200 hover:border-gray-300'}`}
                            >
                              {item.done && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <input 
                              type="text"
                              value={item.text}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleUpdateChecklistText(trip.id, item.id, e.target.value)}
                              className={`flex-1 bg-transparent text-xs font-bold outline-none border-b border-transparent focus:border-gray-200 transition-all py-0.5 ${item.done ? 'text-gray-300 line-through' : 'text-gray-600'}`}
                            />
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChecklistItem(trip.id, item.id);
                              }}
                              className="opacity-0 group-hover/prepItem:opacity-100 p-1 text-gray-200 hover:text-red-500 transition-all font-bold"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddChecklistItem(trip.id);
                          }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 mt-4 border border-dashed border-gray-200 rounded-xl text-[11px] font-bold text-gray-400 hover:text-gray-600 hover:bg-white transition-all shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                        할 일 추가
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ongoingPlans.length === 0 && upcomingPlans.length === 0 && (
          <div className="py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">진행 중이거나 예정된 여행 일정이 없습니다.</p>
            <button 
              onClick={onNavigateToPlanMaker}
              className="mt-4 text-[#1344FF] font-bold hover:underline"
            >
              새로운 여행 계획하기
            </button>
          </div>
        )}

        <div className="bg-[#f8f9fa] rounded-xl p-6">
          <h4 className="text-lg font-bold text-[#1a1a1a] mb-4">지난 여행 기록</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
                  className={`bg-white rounded-xl p-4 hover:shadow-md transition-all border border-gray-100 relative group ${isDeleteMode ? 'cursor-default ring-1 ' + (selectedPlanIds.includes(trip.id) ? 'ring-[#1344FF] bg-blue-50/30' : 'ring-transparent') : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isDeleteMode ? (
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedPlanIds.includes(trip.id) ? 'bg-[#1344FF] border-[#1344FF] text-white' : 'bg-white border-gray-300'}`}>
                          {selectedPlanIds.includes(trip.id) && <Check className="w-3 h-3" />}
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">완료</span>
                      )}
                      {!trip.isOwner && (
                        <span className="flex items-center gap-1 text-[10px] text-orange-500 font-bold">
                          <Users className="w-3 h-3" />
                          공유됨
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!isDeleteMode && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlan(trip.id, trip.isOwner);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-gray-50"
                          title={trip.isOwner ? "삭제" : "나가기"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <h5 className="font-bold text-[#1a1a1a] mb-1 truncate text-left">{trip.title}</h5>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-[#666666]">{trip.dateStr}</p>
                    {trip.duration && (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 whitespace-nowrap">
                        {trip.duration}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400 py-4 text-sm">지난 여행 기록이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
