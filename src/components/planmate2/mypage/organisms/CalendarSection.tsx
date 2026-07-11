import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface CalendarSectionProps {
  currentYear: number;
  currentMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSetDate: (date: Date) => void;
  onToday: () => void;
  gridCells: any[];
  getEventsForDate: (date: Date) => any[];
  onEventClick: (event: any) => void;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({
  currentYear,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onSetDate,
  onToday,
  gridCells,
  getEventsForDate,
  onEventClick,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-[500px] flex flex-col">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-[#1344FF]" />
          <h3 className="text-xl font-bold text-[#1a1a1a]">나의 캘린더</h3>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onPrevMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1344FF] transition-colors"
            title="이전 달"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative group">
            <select
              value={currentYear}
              onChange={(e) => onSetDate(new Date(parseInt(e.target.value), currentMonth, 1))}
              className="appearance-none bg-white border-2 border-gray-100 text-[#1a1a1a] text-sm font-bold py-1.5 pl-3 pr-8 rounded-xl cursor-pointer hover:border-[#1344FF] focus:outline-none focus:border-[#1344FF] transition-all"
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 group-hover:text-[#1344FF]">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <div className="relative group">
            <select
              value={currentMonth}
              onChange={(e) => onSetDate(new Date(currentYear, parseInt(e.target.value), 1))}
              className="appearance-none bg-white border-2 border-gray-100 text-[#1a1a1a] text-sm font-bold py-1.5 pl-3 pr-8 rounded-xl cursor-pointer hover:border-[#1344FF] focus:outline-none focus:border-[#1344FF] transition-all"
            >
              {Array.from({ length: 12 }, (_, i) => i).map(month => (
                <option key={month} value={month}>{month + 1}월</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 group-hover:text-[#1344FF]">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <button 
            onClick={onNextMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1344FF] transition-colors"
            title="다음 달"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <button 
            onClick={onToday}
            className="ml-1 px-3 py-1.5 bg-[#1344FF] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#0d34cc] transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
          >
            오늘
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, idx) => (
            <div key={day} className={`text-center py-2 text-[10px] font-bold ${idx === 0 ? 'text-red-500' : 'text-gray-500'}`}>
              {day[0]}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-7 min-h-full">
            {gridCells.map((cell, idx) => {
              const events = getEventsForDate(cell.date);
              const isToday = cell.day === new Date().getDate() && cell.isCurrentMonth && currentMonth === new Date().getMonth();
              
              return (
                <div 
                  key={idx} 
                  className={`
                    border-r border-b border-gray-100 p-1 relative transition-colors flex flex-col min-h-[60px] h-full
                    ${!cell.isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white text-gray-900'}
                    ${isToday ? 'bg-blue-50/30' : ''}
                  `}
                >
                  <span className={`text-[10px] font-medium w-5 h-5 flex items-center justify-center rounded-full mb-0.5 ${
                    isToday ? 'bg-[#1344FF] text-white' : ''
                  }`}>
                    {cell.day}
                  </span>
                  
                  <div className="flex-1 flex flex-col gap-0.5 mt-0.5 -mx-1.5 pb-1">
                    {(() => {
                      const maxLane = events.length > 0 ? Math.max(...events.map(e => e.lane || 0)) : -1;
                      return Array.from({ length: maxLane + 1 }).map((_, laneIdx) => {
                        const event = events.find(e => e.lane === laneIdx);
                        if (!event) return <div key={laneIdx} className="h-4" />;
                        
                        const isStart = new Date(event.startDate).toDateString() === cell.date.toDateString();
                        const isEnd = new Date(event.endDate).toDateString() === cell.date.toDateString();
                        const isRowStart = idx % 7 === 0;
                        const showTitle = isStart || isRowStart;
                        
                        const roundedLeft = isStart ? 'rounded-l-[4px] ml-1.5' : ''; 
                        const roundedRight = isEnd ? 'rounded-r-[4px] mr-1.5' : ''; 

                        return (
                          <div 
                            key={`${event.id}-${laneIdx}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                            className={`
                              text-[8px] h-4 flex items-center px-1 truncate relative z-10 cursor-pointer
                              transition-colors
                              ${event.status === '완료' 
                                ? 'bg-gray-200 text-gray-700 font-bold' 
                                : (event.theme === 'blue' ? 'bg-[#1344FF] text-white' : 'bg-orange-400 text-white')
                              }
                              ${roundedLeft} ${roundedRight}
                            `}
                            title={event.title}
                          >
                            {showTitle && <span className="truncate font-bold pl-1">{event.title}</span>}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
