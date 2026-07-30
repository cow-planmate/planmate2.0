import { CheckCircle2, Pencil } from 'lucide-react';
import React from 'react';
import { ModalFrame } from '../../mypage/molecules/ModalFrame';

interface ForkResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  /** 시간이 겹쳐 뒤로 밀린 블록 수 (0이면 안내하지 않음) */
  adjustedBlocks: number;
  onEdit: () => void;
  onGoToMyTrips: () => void;
}

/** 가져가기 완료 안내 — 바로 편집으로 이어갈 수 있게 한다 */
export const ForkResultModal: React.FC<ForkResultModalProps> = ({
  isOpen,
  onClose,
  planName,
  adjustedBlocks,
  onEdit,
  onGoToMyTrips,
}) => (
  <ModalFrame isOpen={isOpen} onClose={onClose} title="일정을 가져왔습니다" maxWidth="sm">
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-6 h-6 text-[#1344FF] shrink-0 mt-0.5" />
        <p className="text-[#666666] leading-relaxed">
          <span className="font-bold text-[#1a1a1a]">"{planName}"</span>이(가) 내 여행에 추가되었어요.
          지금 편집할까요?
        </p>
      </div>

      {adjustedBlocks > 0 && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          시간이 겹치는 일정 {adjustedBlocks}개는 순서를 유지한 채 뒤로 밀어 배치했습니다. 편집에서 확인해주세요.
        </p>
      )}

      <div className="space-y-2">
        <button
          type="button"
          onClick={onEdit}
          className="w-full py-3 rounded-xl bg-[#1344FF] text-white font-bold hover:bg-[#0d34cc] transition-colors flex items-center justify-center gap-2"
        >
          <Pencil className="w-4 h-4" />
          편집하기
        </button>
        <button
          type="button"
          onClick={onGoToMyTrips}
          className="w-full py-3 rounded-xl border border-[#e5e7eb] text-[#1a1a1a] font-bold hover:bg-gray-50 transition-colors"
        >
          내 여행에서 보기
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 text-sm text-[#999999] font-medium hover:underline"
        >
          나중에
        </button>
      </div>
    </div>
  </ModalFrame>
);
