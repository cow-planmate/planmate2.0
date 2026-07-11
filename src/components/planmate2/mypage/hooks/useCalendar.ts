import { useMemo } from 'react';

export const useCalendar = (date: Date, setDate: (date: Date) => void, eventsWithLanes: any[]) => {
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();

  const handlePrevMonth = () => {
    setDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  
  const gridCells = useMemo(() => {
    const cells = [];
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    
    // Previous month filler
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth - 1, prevMonthDays - i)
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentYear, currentMonth, i)
      });
    }
    
    // Next month filler
    const remainingCells = 42 - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      cells.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth + 1, i)
      });
    }
    return cells;
  }, [currentYear, currentMonth, firstDayOfMonth, daysInMonth]);

  const getEventsForDate = (cellDate: Date) => {
    return eventsWithLanes.filter(trip => {
      if (!trip.hasDates) return false;
      const start = new Date(trip.startDate);
      start.setHours(0,0,0,0);
      const end = new Date(trip.endDate);
      end.setHours(23,59,59,999);
      const current = new Date(cellDate);
      current.setHours(12,0,0,0);
      return current >= start && current <= end;
    });
  };

  return {
    handlePrevMonth,
    handleNextMonth,
    gridCells,
    getEventsForDate,
    currentYear,
    currentMonth,
  };
};
