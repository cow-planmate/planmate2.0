import { Check, Settings } from 'lucide-react';
import React from 'react';
import { Button } from '../atoms/Button';
import { ModalFrame } from '../molecules/ModalFrame';

interface LevelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: any;
  LEVEL_CONFIG: any;
}

const LevelInfoModal: React.FC<LevelInfoModalProps> = ({
  isOpen,
  onClose,
  userStats,
  LEVEL_CONFIG,
}) => {
  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onClose}
      title="활동 등급 안내"
    >
      {/* 점수 산식은 서버(UserStatsRepository.recalculateLevel)와 같다 */}
      <p className="mb-4 text-sm text-gray-500">게시글·여행기 1개에 3점, 댓글 1개에 1점이 쌓여요.</p>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {LEVEL_CONFIG.map((config: any) => {
          const isCurrentLevel = userStats.level === config.name;

          return (
            <div 
              key={config.lv} 
              className={`p-4 rounded-2xl border-2 transition-all ${
                isCurrentLevel 
                  ? 'border-[#1344FF] bg-blue-50/50 ring-4 ring-blue-50' 
                  : 'border-gray-50 bg-white opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isCurrentLevel ? 'bg-[#1344FF] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {isCurrentLevel ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-sm font-bold block">{config.name}</span>
                    <span className="text-[11px] text-gray-400 font-medium tracking-wider uppercase">{config.range}</span>
                  </div>
                </div>
                {isCurrentLevel && (
                  <span className="bg-[#1344FF] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">Current</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <Button variant="outline" fullWidth onClick={onClose}>
          닫기
        </Button>
      </div>
    </ModalFrame>
  );
};

export default LevelInfoModal;
