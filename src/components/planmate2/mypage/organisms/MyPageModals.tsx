import React from 'react';
import DeleteAccountModal from '../modals/DeleteAccountModal';
import EventDetailModal from '../modals/EventDetailModal';
import LevelInfoModal from '../modals/LevelInfoModal';
import PasswordChangeModal from '../modals/PasswordChangeModal';
import ProfileEditModal from '../modals/ProfileEditModal';

interface MyPageModalsProps {
  // Common
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  
  // Profile Modal
  newNickname: string;
  handleNicknameUpdate: () => void;
  setNewNickname: (val: string) => void;
  newAge: number;
  setNewAge: (val: number) => void;
  newGender: number;
  setNewGender: (val: number) => void;
  isNicknameVerified: boolean;
  nicknameMessage: string;
  handleCheckNickname: () => void;
  nicknameValid: boolean | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dummyUser: any;
  onOpenThemeEditor: () => void;
  
  // Level Modal
  userStats: any;
  LEVEL_CONFIG: any;
  
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
  newAge,
  setNewAge,
  newGender,
  setNewGender,
  isNicknameVerified,
  nicknameMessage,
  nicknameValid,
  handleCheckNickname,
  handleImageUpload,
  dummyUser,
  userStats,
  LEVEL_CONFIG,
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
  selectedDateEvents,
}) => {
  if (!activeModal) return null;

  return (
    <>
      <ProfileEditModal
        isOpen={activeModal === 'profile'}
        onClose={() => setActiveModal(null)}
        dummyUser={dummyUser}
        handleImageUpload={handleImageUpload}
        newNickname={newNickname}
        setNewNickname={setNewNickname}
        nicknameValid={nicknameValid}
        handleCheckNickname={handleCheckNickname}
        nicknameMessage={nicknameMessage}
        newAge={newAge}
        setNewAge={setNewAge}
        newGender={newGender}
        setNewGender={setNewGender}
        onOpenThemeEditor={onOpenThemeEditor}
        onOpenPasswordChange={() => setActiveModal('changePassword')}
        onOpenDeleteAccount={() => setActiveModal('deleteAccount')}
        handleNicknameUpdate={handleNicknameUpdate}
        isNicknameVerified={isNicknameVerified}
      />

      <PasswordChangeModal
        isOpen={activeModal === 'changePassword'}
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

      <LevelInfoModal
        isOpen={activeModal === 'level'}
        onClose={() => setActiveModal(null)}
        userStats={userStats}
        LEVEL_CONFIG={LEVEL_CONFIG}
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
