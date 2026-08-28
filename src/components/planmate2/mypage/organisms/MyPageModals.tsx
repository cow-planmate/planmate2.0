import React from 'react';
import DeleteAccountModal from '../modals/DeleteAccountModal';
import EventDetailModal from '../modals/EventDetailModal';
import PasswordChangeModal from '../modals/PasswordChangeModal';
import ProfileEditModal from '../modals/ProfileEditModal';
import type { Gender } from '../types';

interface MyPageModalsProps {
  // Common
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  
  // Profile Modal
  newNickname: string;
  handleNicknameUpdate: () => void;
  setNewNickname: (val: string) => void;
  newBirthdate: string;
  setNewBirthdate: (val: string) => void;
  newGender: Gender | '';
  setNewGender: (val: Gender) => void;
  isNicknameVerified: boolean;
  nicknameMessage: string;
  handleCheckNickname: () => void;
  nicknameValid: boolean | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: () => void;
  isUploadingImage?: boolean;
  /** 저장 전 미리보기를 반영한 아바타 이미지 */
  profileEditImage?: string | null;
  canRemoveProfileImage?: boolean;
  /** 저장하지 않고 닫을 때 (예약된 사진 변경을 버린다) */
  onCloseProfileEdit?: () => void;
  dummyUser: any;
  onOpenThemeEditor: () => void;

  // Delete Modal
  handleDeleteAccount: () => void;
  
  // Password Modal
  currentPassword?: string;
  setCurrentPassword?: (val: string) => void;
  newPassword?: string;
  setNewPassword?: (val: string) => void;
  confirmPassword?: string;
  setConfirmPassword?: (val: string) => void;
  handlePasswordUpdate?: () => void;
  isSocialLogin: boolean;
  
  // Calendar Event Modal
  selectedDateEvents: any[];
  onNavigateDetail: (post: any) => void;
}

export const MyPageModals: React.FC<MyPageModalsProps> = ({
  activeModal,
  setActiveModal,
  newNickname,
  handleNicknameUpdate,
  setNewNickname,
  newBirthdate,
  setNewBirthdate,
  newGender,
  setNewGender,
  isNicknameVerified,
  nicknameMessage,
  nicknameValid,
  handleCheckNickname,
  handleImageUpload,
  onRemoveImage,
  isUploadingImage,
  profileEditImage,
  canRemoveProfileImage,
  onCloseProfileEdit,
  dummyUser,
  onNavigateDetail,
  onOpenThemeEditor,
  handleDeleteAccount,
  currentPassword = '',
  setCurrentPassword = () => {},
  newPassword = '',
  setNewPassword = () => {},
  confirmPassword = '',
  setConfirmPassword = () => {},
  handlePasswordUpdate = () => {},
  isSocialLogin,
  selectedDateEvents,
}) => {
  if (!activeModal) return null;

  return (
    <>
      <ProfileEditModal
        isOpen={activeModal === 'profile'}
        onClose={onCloseProfileEdit ?? (() => setActiveModal(null))}
        dummyUser={dummyUser}
        handleImageUpload={handleImageUpload}
        onRemoveImage={onRemoveImage}
        isUploadingImage={isUploadingImage}
        profileEditImage={profileEditImage}
        canRemoveProfileImage={canRemoveProfileImage}
        newNickname={newNickname}
        setNewNickname={setNewNickname}
        nicknameValid={nicknameValid}
        handleCheckNickname={handleCheckNickname}
        nicknameMessage={nicknameMessage}
        newBirthdate={newBirthdate}
        setNewBirthdate={setNewBirthdate}
        newGender={newGender}
        setNewGender={setNewGender}
        onOpenThemeEditor={onOpenThemeEditor}
        isSocialLogin={isSocialLogin}
        onOpenPasswordChange={() => {
          if (!isSocialLogin) setActiveModal('changePassword');
        }}
        onOpenDeleteAccount={() => setActiveModal('deleteAccount')}
        handleNicknameUpdate={handleNicknameUpdate}
        isNicknameVerified={isNicknameVerified}
      />

      <PasswordChangeModal
        isOpen={activeModal === 'changePassword' && !isSocialLogin}
        onClose={() => setActiveModal(null)}
        onBack={() => setActiveModal('profile')}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        handlePasswordUpdate={handlePasswordUpdate}
      />

      <DeleteAccountModal
        isOpen={activeModal === 'deleteAccount'}
        onClose={() => setActiveModal(null)}
        onDelete={handleDeleteAccount}
      />

      <EventDetailModal
        isOpen={activeModal === 'eventDetail'}
        onClose={() => setActiveModal(null)}
        selectedDateEvents={selectedDateEvents}
        onNavigateDetail={onNavigateDetail}
      />
    </>
  );
};
