import { AlertCircle } from 'lucide-react';
import React from 'react';
import { ModalFrame } from '../molecules/ModalFrame';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDateEvents: any[];
  onNavigateDetail: (post: any) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  selectedDateEvents,
  onNavigateDetail,
}) => {
  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#1344FF]" />
          <span className="font-bold text-[#1a1a1a]">이 날의 여행 일정</span>
        </div>
      }
      maxWidth="sm"
    >
      <div className="space-y-3">
        {selectedDateEvents?.map((event, i) => (
          <div 
            key={i} 
            onClick={() => onNavigateDetail(event)}
            className="group p-4 rounded-2xl border-2 border-gray-50 hover:border-[#1344FF] hover:bg-blue-50/50 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-center gap-2">
              <h4 className="font-bold text-gray-900 group-hover:text-[#1344FF] transition-colors truncate">
                {event.title}
              </h4>
              <span className="text-[11px] text-gray-400 font-medium shrink-0">
                {event.dateStr}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              {event.destination}
            </p>
          </div>
        ))}
      </div>
    </ModalFrame>
  );
};

export default EventDetailModal;
