import { useEffect, useState } from 'react';

export const usePlanChecklists = (myPlans: any[], editablePlans: any[]) => {
  const [planChecklists, setPlanChecklists] = useState<Record<number, any[]>>({});

  useEffect(() => {
    const newChecklists: Record<number, any[]> = { ...planChecklists };
    let changed = false;

    [...myPlans, ...editablePlans].forEach(plan => {
      if (!newChecklists[plan.planId]) {
        newChecklists[plan.planId] = [
          { id: Date.now() + Math.random(), text: '숙소 예약 확인', done: true },
          { id: Date.now() + Math.random(), text: '짐 싸기 완료', done: false },
          { id: Date.now() + Math.random(), text: '맛집 리스트 체크', done: false },
        ];
        changed = true;
      }
    });

    if (changed) {
      setPlanChecklists(newChecklists);
    }
  }, [myPlans, editablePlans]);

  const handleToggleChecklist = (planId: number, itemId: number) => {
    setPlanChecklists(prev => ({
      ...prev,
      [planId]: prev[planId].map(item => 
        item.id === itemId ? { ...item, done: !item.done } : item
      )
    }));
  };

  const handleUpdateChecklistText = (planId: number, itemId: number, newText: string) => {
    setPlanChecklists(prev => ({
      ...prev,
      [planId]: prev[planId].map(item => 
        item.id === itemId ? { ...item, text: newText } : item
      )
    }));
  };

  const handleAddChecklistItem = (planId: number) => {
    const newItem = { id: Date.now(), text: '할 일 입력', done: false };
    setPlanChecklists(prev => ({
      ...prev,
      [planId]: [...(prev[planId] || []), newItem]
    }));
  };

  const handleDeleteChecklistItem = (planId: number, itemId: number) => {
    setPlanChecklists(prev => ({
      ...prev,
      [planId]: prev[planId].filter(item => item.id !== itemId)
    }));
  };

  return {
    planChecklists,
    handleToggleChecklist,
    handleUpdateChecklistText,
    handleAddChecklistItem,
    handleDeleteChecklistItem
  };
};
