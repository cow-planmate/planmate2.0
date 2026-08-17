import { Camera, Loader2, Settings, Trash2, TriangleAlert, User } from 'lucide-react';
import React from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { FormItem } from '../molecules/FormItem';
import { ModalFrame } from '../molecules/ModalFrame';
import type { Gender } from '../types';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  dummyUser: any;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: () => void;
  isUploadingImage?: boolean;
  /** 저장 전 미리보기까지 반영한 아바타 이미지 (없으면 저장된 프로필 사진) */
  profileEditImage?: string | null;
  canRemoveProfileImage?: boolean;
  newNickname: string;
  setNewNickname: (val: string) => void;
  nicknameValid: boolean | null;
  handleCheckNickname: () => void;
  nicknameMessage: string;
  newBirthdate: string;
  setNewBirthdate: (val: string) => void;
  newGender: Gender | '';
  setNewGender: (val: Gender) => void;
  onOpenThemeEditor: () => void;
  onOpenPasswordChange: () => void;
  isSocialLogin: boolean;
  onOpenDeleteAccount: () => void;
  handleNicknameUpdate: () => void;
  isNicknameVerified: boolean;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  dummyUser,
  handleImageUpload,
  onRemoveImage,
  isUploadingImage = false,
  profileEditImage,
  canRemoveProfileImage,
  newNickname,
  setNewNickname,
  nicknameValid,
  handleCheckNickname,
  nicknameMessage,
  newBirthdate,
  setNewBirthdate,
  newGender,
  setNewGender,
  onOpenThemeEditor,
  onOpenPasswordChange,
  isSocialLogin,
  onOpenDeleteAccount,
  handleNicknameUpdate,
  isNicknameVerified,
}) => {
  const avatarImage =
    profileEditImage !== undefined ? profileEditImage : dummyUser.profileLogo;
  const showRemoveButton =
    canRemoveProfileImage !== undefined
      ? canRemoveProfileImage
      : Boolean(dummyUser.profileLogo);

  return (
    <ModalFrame 
      isOpen={isOpen} 
      onClose={onClose} 
      headerType="gradient"
    >
      {/* Avatar Placement - centered on the line between gradient and content */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-20">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-[6px] border-white overflow-hidden bg-gray-100 shadow-xl transition-transform hover:scale-105 flex items-center justify-center">
            {avatarImage ? (
              <img
                src={avatarImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-14 h-14 text-gray-400" />
            )}
            {isUploadingImage && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <label
            className={`absolute bottom-1 right-1 p-2.5 bg-[#1344FF] rounded-full text-white shadow-lg transition-all border-4 border-white ${
              isUploadingImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#0031E5]'
            }`}
            title="사진 변경"
          >
            <Camera className="w-5 h-5" />
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp"
              disabled={isUploadingImage}
              onChange={handleImageUpload}
            />
          </label>
          {showRemoveButton && onRemoveImage && (
            <button
              onClick={onRemoveImage}
              disabled={isUploadingImage}
              title="기본 이미지로 되돌리기"
              className="absolute bottom-1 left-1 p-2.5 bg-white rounded-full text-gray-400 shadow-lg border-4 border-white transition-all hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
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
              type="date"
              value={newBirthdate}
              onChange={(e) => setNewBirthdate(e.target.value)}
              placeholder="나이"
            />
          </FormItem>
          <FormItem label="성별">
            <div className="flex bg-gray-50 rounded-xl p-1 border-2 border-gray-100 h-[52px]">
              <button
                onClick={() => setNewGender('MALE')}
                className={`flex-1 rounded-lg text-sm font-bold transition-all ${newGender === 'MALE' ? 'bg-white text-[#1344FF] shadow-sm' : 'text-gray-400'}`}
              >
                남성
              </button>
              <button
                onClick={() => setNewGender('FEMALE')}
                className={`flex-1 rounded-lg text-sm font-bold transition-all ${newGender === 'FEMALE' ? 'bg-white text-[#1344FF] shadow-sm' : 'text-gray-400'}`}
              >
                여성
              </button>
              <button
                onClick={() => setNewGender('OTHER')}
                className={`flex-1 rounded-lg text-sm font-bold transition-all ${newGender === 'OTHER' ? 'bg-white text-[#1344FF] shadow-sm' : 'text-gray-400'}`}
              >
                기타
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
          {!isSocialLogin ? (
            <FormItem label="보안 설정">
              <button
                onClick={onOpenPasswordChange}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-gray-100 hover:border-[#1344FF]/30 bg-gray-50 transition-all group h-[52px]"
              >
                <span className="text-xs font-bold text-gray-600">비밀번호 변경</span>
                <Settings className="w-4 h-4 text-gray-400 group-hover:text-[#1344FF] transition-colors" />
              </button>
            </FormItem>
          ) : null}
        </div>
      </div>

      <Button
        variant="primary"
        fullWidth
        className="mt-6"
        onClick={handleNicknameUpdate}
        disabled={
          isUploadingImage ||
          (newNickname !== dummyUser.nickName && !isNicknameVerified)
        }
      >
        {isUploadingImage ? '저장 중...' : '변경사항 저장하기'}
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
