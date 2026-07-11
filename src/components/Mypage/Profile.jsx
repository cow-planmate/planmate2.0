// Profile.jsx
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faCalendar,
  faVenus,
  faMars,
  faHeart,
  faLock,
  faSignOutAlt,
  faUtensils,
  faBed,
  faMapMarkerAlt,
  faPen,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import ProfileText from "./ProfileText";
import { useApiClient } from "../../hooks/useApiClient";
import { useNavigate } from "react-router-dom";
import NicknameModal from "./NicknameChange";
import gravatarUrl from "../../utils/gravatarUrl";
import { SuccessToast } from "../common/Toast";

export default function Profile({ userProfile, setUserProfile }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);

  const gender = { 0: "남자", 1: "여자" };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full flex flex-col">
      {/* 프로필 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col items-center text-black">
          {userProfile && (
            <>
              <div
                className={`w-20 h-20 bg-contain bg-no-repeat rounded-full`}
                style={{
                  backgroundImage: `url('${gravatarUrl(userProfile.email)}')`,
                }}
              ></div>
              <div className="text-center mt-4">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {userProfile.nickname}
                  </h2>
                  <button
                    onClick={() => setIsNicknameModalOpen(true)}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                  </button>
                  {isNicknameModalOpen && (
                    <NicknameModal
                      setIsNicknameModalOpen={setIsNicknameModalOpen}
                      currentNickname={userProfile.nickname}
                      onNicknameUpdate={(newNickname) => {
                        setUserProfile({
                          ...userProfile,
                          nickname: newNickname,
                        });
                      }}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4 bg-gray-50/30">
        {userProfile && (
          <>
            <ProfileText
              icon={faEnvelope}
              title="이메일"
              content={userProfile.email}
              change={false}
              iconColor="text-gray-700"
            />
            <ProfileText
              icon={faCalendar}
              title="나이"
              content={userProfile.age}
              change={true}
              iconColor="text-gray-700"
            />
            <ProfileText
              icon={userProfile.gender === 0 ? faMars : faVenus}
              title="성별"
              content={gender[userProfile.gender]}
              change={true}
              iconColor="text-gray-700"
            />
            <ProfileText
              icon={faHeart}
              title="선호테마"
              content={userProfile.preferredThemes}
              change={true}
              iconColor="text-gray-700"
            />
            {userProfile.socialLogin === false && (
              <ProfileText
                icon={faLock}
                title="비밀번호"
                content="password"
                change={false}
                iconColor="text-gray-500"
              />
            )}
          </>
        )}

        {/* 탈퇴 버튼 */}
        <div className="pt-2">
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            탈퇴하기
          </button>
          {isDeleteOpen ? (
            <DeleteModal setIsDeleteOpen={setIsDeleteOpen} />
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

const DeleteModal = ({ setIsDeleteOpen }) => {
  const { del, isAuthenticated, logout } = useApiClient();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_URL;
  const [realDelete, setRealDelete] = useState(false);
  const [warnMsg, setWarnMsg] = useState(false);

  const handleDelete = async () => {
    if (isAuthenticated() && realDelete) {
      try {
        await del(`${BASE_URL}/api/user/account`);
        await logout();
        setIsDeleteOpen(false);
        navigate("/");
        SuccessToast("탈퇴되었습니다.");
      } catch (err) {
        console.error("탈퇴 과정에서 오류가 발생했습니다:", err);
      }
    } else {
      setWarnMsg(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-bold">탈퇴하기</h2>
        <ul className="mt-4 list-disc ml-5">
          <li>확인 버튼을 누를 시 탈퇴 처리됩니다.</li>
          <li>
            탈퇴 처리는{" "}
            <span className="text-red-500 underline">
              절대 되돌릴 수 없습니다.
            </span>
          </li>
          <li className="font-semibold">정말로 탈퇴하시겠습니까?</li>
        </ul>
        <div className="my-4">
          <div className="space-x-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onClick={() => setRealDelete((prev) => !prev)}
              />
              <span className="font-semibold">위 내용을 확인했습니다.</span>
            </label>
          </div>
          {warnMsg ? (
            <p className="text-sm text-red-500">
              <FontAwesomeIcon icon={faTriangleExclamation} /> 체크박스에
              체크하셔야 탈퇴가 진행됩니다!
            </p>
          ) : (
            <></>
          )}
        </div>
        <div className="flex justify-between gap-2">
          <button
            onClick={() => setIsDeleteOpen(false)}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 w-full"
          >
            취소
          </button>
          <button
            onClick={() => handleDelete()}
            className="px-3 py-1 bg-red-500 text-white rounded w-full hover:bg-red-700"
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
};
