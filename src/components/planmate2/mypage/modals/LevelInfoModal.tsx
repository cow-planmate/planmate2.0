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
  // 등급별 가상 혜택 데이터 (constants에 없을 경우 대비)
  const getPerks = (lv: number) => {
    switch (lv) {
      case 1: return ['기본 여행 일정 생성', '커뮤니티 글 작성'];
      case 2: return ['나만의 테마 설정 가능', '인기 게시글 알림'];
      case 3: return ['전문가 뱃지 부여', '일정 보관함 확장'];
      case 4: return ['추천 경로 최우선 노출', '여행기 PDF 내보내기'];
      case 5: return ['모든 기능 무제한', '레전드 전용 테마 적용'];
      default: return ['기본 기능 이용'];
    }
  };

  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onClose}
      title="등급 및 혜택 안내"
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {LEVEL_CONFIG.map((config: any) => {
          const isCurrentLevel = userStats.level === config.name;
          const perks = config.perks || getPerks(config.lv);

          return (
            <div 
              key={config.lv} 
              className={`p-4 rounded-2xl border-2 transition-all ${
                isCurrentLevel 
                  ? 'border-[#1344FF] bg-blue-50/50 ring-4 ring-blue-50' 
                  : 'border-gray-50 bg-white opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
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
              <ul className="space-y-2">
                {perks.map((perk: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className={`w-1 h-1 rounded-full ${isCurrentLevel ? 'bg-[#1344FF]' : 'bg-gray-300'}`} />
                    {perk}
                  </li>
                ))}
              </ul>
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
