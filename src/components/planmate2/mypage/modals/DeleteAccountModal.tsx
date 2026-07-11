import { TriangleAlert } from 'lucide-react';
import React from 'react';
import { Button } from '../atoms/Button';
import { ModalFrame } from '../molecules/ModalFrame';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onDelete,
}) => {
  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
    >
      <div className="text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
          <TriangleAlert className="w-10 h-10 -rotate-12" />
        </div>
        <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">정말 떠나시나요?</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          계정을 삭제하면 그동안의 여행 기록과<br />
          커뮤니티 활동 정보가 <strong>즉시 소멸</strong>됩니다.<br />
          이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="flex flex-col gap-3">
          <Button variant="danger" fullWidth onClick={onDelete}>
            계정 영구 삭제
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose} className="text-gray-400 font-bold">
            조금 더 생각해볼게요
          </Button>
        </div>
      </div>
    </ModalFrame>
  );
};

export default DeleteAccountModal;
