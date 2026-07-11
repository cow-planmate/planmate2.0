import { Check, Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { FormItem } from '../molecules/FormItem';
import { ModalFrame } from '../molecules/ModalFrame';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  handlePasswordUpdate: () => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onBack,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handlePasswordUpdate,
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const passwordValidation = {
    hasMinLength: newPassword.length >= 8,
    hasMaxLength: newPassword.length <= 20,
    hasEnglish: /[a-zA-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };
  
  const hasAllRequired = passwordValidation.hasEnglish && passwordValidation.hasNumber && passwordValidation.hasSpecialChar;
  const isPasswordValid = passwordValidation.hasMinLength && passwordValidation.hasMaxLength && hasAllRequired;

  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-[11px]">
      <Check className={`w-3.5 h-3.5 ${isValid ? 'text-green-500' : 'text-gray-300'}`} />
      <span className={isValid ? "text-green-600 font-bold" : "text-gray-400 font-medium"}>
        {text}
      </span>
    </div>
  );

  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onBack}
      title="비밀번호 변경"
      subtitle="보안을 위해 새로운 비밀번호를 입력해주세요."
    >
      <div className="space-y-5">
        <FormItem label="현재 비밀번호">
          <Input
            type={showCurrentPassword ? "text" : "password"}
            placeholder="현재 비밀번호 입력"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            rightElement={
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
          />
        </FormItem>

        <FormItem label="새 비밀번호">
          <Input
            type={showPassword ? "text" : "password"}
            className={newPassword ? (isPasswordValid ? 'border-green-500 bg-green-50/10' : 'border-blue-500 bg-blue-50/10') : ''}
            placeholder="새로운 비밀번호 입력"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
          />
          
          <div className="mt-2 p-4 bg-[#F8F9FA] rounded-2xl space-y-2.5 border border-[#F1F3F5]">
            <ValidationItem
              isValid={passwordValidation.hasMinLength}
              text="최소 8자"
            />
            <ValidationItem
              isValid={hasAllRequired}
              text="영문, 숫자, 특수문자 3가지 조합"
            />
            {newPassword && !passwordValidation.hasMaxLength && (
              <p className="text-red-500 text-[10px] font-bold mt-1 pl-6">최대 20자까지 가능합니다.</p>
            )}
          </div>
        </FormItem>

        <FormItem label="비밀번호 재입력">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            className={confirmPassword ? (newPassword === confirmPassword ? 'border-green-500 bg-green-50/10' : 'border-red-500 bg-red-50/10') : ''}
            placeholder="비밀번호 다시 입력"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">비밀번호가 일치하지 않습니다.</p>
          )}
        </FormItem>
      </div>

      <div className="flex gap-3 mt-10">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          취소
        </Button>
        <Button
          className="flex-[2]"
          onClick={handlePasswordUpdate}
          disabled={!currentPassword || !isPasswordValid || newPassword !== confirmPassword}
        >
          비밀번호 변경 완료
        </Button>
      </div>
    </ModalFrame>
  );
};

export default PasswordChangeModal;
