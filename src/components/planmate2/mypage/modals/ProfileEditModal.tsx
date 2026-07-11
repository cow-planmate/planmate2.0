import { Camera, Settings, TriangleAlert } from 'lucide-react';
import React from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { FormItem } from '../molecules/FormItem';
import { ModalFrame } from '../molecules/ModalFrame';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  dummyUser: any;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newNickname: string;
  setNewNickname: (val: string) => void;
  nicknameValid: boolean | null;
  handleCheckNickname: () => void;
  nicknameMessage: string;
  newAge: number;
  setNewAge: (val: number) => void;
  newGender: number;
  setNewGender: (val: number) => void;
  onOpenThemeEditor: () => void;
  onOpenPasswordChange: () => void;
  onOpenDeleteAccount: () => void;
  handleNicknameUpdate: () => void;
  isNicknameVerified: boolean;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  dummyUser,
  handleImageUpload,
  newNickname,
  setNewNickname,
  nicknameValid,
  handleCheckNickname,
  nicknameMessage,
  newAge,
  setNewAge,
  newGender,
  setNewGender,
  onOpenThemeEditor,
  onOpenPasswordChange,
  onOpenDeleteAccount,
  handleNicknameUpdate,
  isNicknameVerified,
}) => {
  return (
    <ModalFrame 
      isOpen={isOpen} 
      onClose={onClose} 
      headerType="gradient"
    >
      {/* Avatar Placement - centered on the line between gradient and content */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-20">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-[6px] border-white overflow-hidden bg-gray-100 shadow-xl transition-transform hover:scale-105">
            <img 
              src={dummyUser.profileLogo} 
              alt="Profile" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; // Fallback
              }}
            />
          </div>
          <label className="absolute bottom-1 right-1 p-2.5 bg-[#1344FF] rounded-full text-white cursor-pointer shadow-lg hover:bg-[#0031E5] transition-all border-4 border-white">
            <Camera className="w-5 h-5" />
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>
      </div>

      <div className="text-center mb-10 pt-4">
        <h3 className="text-2xl font-bold text-[#1a1a1a]">프로필 수정</h3>
        <p className="text-sm text-gray-500 mt-1">나를 표현하는 정보를 변경해보세요</p>
      </div>

      <div className="space-y-6">
        <FormItem label="이메일 계정">
          <div className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 text-gray-400 text-sm font-medium">
            {dummyUser.email}
          </div>
        </FormItem>

        <FormItem 
          label="닉네임" 
          helperText={nicknameMessage} 
          isError={nicknameValid === false}
        >
          <div className="flex gap-2">
            <Input
              isValid={nicknameValid}
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              placeholder="새 닉네임을 입력하세요"
            />
            <Button 
              variant="secondary" 
              onClick={handleCheckNickname}
              className="px-4 py-3 text-xs whitespace-nowrap"
            >
              중복 확인
            </Button>
          </div>
        </FormItem>

        <div className="grid grid-cols-2 gap-4">
          <FormItem label="나이">
            <Input
              type="number"
              value={newAge}
              onChange={(e) => setNewAge(parseInt(e.target.value) || 0)}
              placeholder="나이"
            />
          </FormItem>
          <FormItem label="성별">
            <div className="flex bg-gray-50 rounded-xl p-1 border-2 border-gray-100 h-[52px]">
              <button
                onClick={() => setNewGender(0)}
                className={`flex-1 rounded-lg text-sm font-bold transition-all ${newGender === 0 ? 'bg-white text-[#1344FF] shadow-sm' : 'text-gray-400'}`}
              >
                남성
              </button>
              <button
                onClick={() => setNewGender(1)}
                className={`flex-1 rounded-lg text-sm font-bold transition-all ${newGender === 1 ? 'bg-white text-[#1344FF] shadow-sm' : 'text-gray-400'}`}
              >
                여성
              </button>
            </div>
          </FormItem>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormItem label="여행 취향">
            <button
              onClick={onOpenThemeEditor}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-gray-100 hover:border-[#1344FF]/30 bg-gray-50 transition-all group h-[52px]"
            >
              <span className="text-xs font-bold text-gray-600">테마 변경</span>
              <Settings className="w-4 h-4 text-gray-400 group-hover:text-[#1344FF] transition-colors" />
            </button>
          </FormItem>
          <FormItem label="보안 설정">
            <button
              onClick={onOpenPasswordChange}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-gray-100 hover:border-[#1344FF]/30 bg-gray-50 transition-all group h-[52px]"
            >
              <span className="text-xs font-bold text-gray-600">비밀번호 변경</span>
              <Settings className="w-4 h-4 text-gray-400 group-hover:text-[#1344FF] transition-colors" />
            </button>
          </FormItem>
        </div>
      </div>

      <Button
        variant="primary"
        fullWidth
        className="mt-6"
        onClick={handleNicknameUpdate}
        disabled={newNickname !== dummyUser.nickName && !isNicknameVerified}
      >
        변경사항 저장하기
      </Button>

      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
        <button 
          onClick={onOpenDeleteAccount}
          className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-2"
        >
          <TriangleAlert className="w-4 h-4" />
          계정 탈퇴하기
        </button>
      </div>
    </ModalFrame>
  );
};

export default ProfileEditModal;
