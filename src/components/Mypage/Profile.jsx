import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faCalendar,
  faVenus,
  faMars,
  faHeart,
  faLock,
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

  // 📌 v2 명세서의 Gender Enum 문자열 매핑 적용
  const genderMap = { MALE: "남자", FEMALE: "여자" };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full flex flex-col">
      {/* 프로필 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col items-center text-black">
          {userProfile && (
            <>
              <div
                className="w-20 h-20 bg-contain bg-no-repeat rounded-full shadow-sm"
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
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
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
              iconColor="text-gray-600"
            />
            <ProfileText
              icon={faCalendar}
              title="나이"
              // 부모(MyPage) 컴포넌트와의 데이터 규격을 위해 userProfile.age 바인딩 유지
              content={userProfile.age}
              change={true}
              iconColor="text-gray-600"
            />
            <ProfileText
              // 📌 userProfile.gender가 "MALE"인지 비교하도록 v2 스펙 반영
              icon={userProfile.gender === "MALE" ? faMars : faVenus}
              title="성별"
              content={genderMap[userProfile.gender] || "선택 안함"}
              change={true}
              iconColor="text-gray-600"
            />
            <ProfileText
              icon={faHeart}
              title="선호테마"
              content={userProfile.preferredThemes}
              change={true}
              iconColor="text-gray-600"
            />
            {/* 📌 v2 Response 명세 변수명으로 교정: socialLogin -> isSocialLogin */}
            {userProfile.isSocialLogin === false && (
              <ProfileText
                icon={faLock}
                title="비밀번호"
                content="password"
                change={false}
                iconColor="text-gray-400"
              />
            )}
          </>
        )}

        {/* 탈퇴 버튼 */}
        <div className="pt-2">
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="px-3 py-1.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            탈퇴하기
          </button>
          {isDeleteOpen && <DeleteModal setIsDeleteOpen={setIsDeleteOpen} />}
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
        // 📌 v2 연계 API: DELETE /api/user/account
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-80 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">탈퇴하기</h2>
        <ul className="mt-4 list-disc ml-5 text-sm text-gray-600 space-y-1">
          <li>확인 버튼을 누를 시 탈퇴 처리됩니다.</li>
          <li>
            탈퇴 처리는{" "}
            <span className="text-red-500 font-medium underline">
              절대 되돌릴 수 없습니다.
            </span>
          </li>
          <li className="font-semibold text-gray-800">
            정말로 탈퇴하시겠습니까?
          </li>
        </ul>

        <div className="my-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded text-[#1344FF] focus:ring-[#1344FF]"
              checked={realDelete}
              onChange={() => {
                setRealDelete((prev) => !prev);
                if (!realDelete) setWarnMsg(false);
              }}
            />
            <span className="text-sm font-semibold text-gray-700">
              위 내용을 확인했습니다.
            </span>
          </label>

          {warnMsg && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              체크박스에 동의하셔야 탈퇴가 진행됩니다.
            </p>
          )}
        </div>

        <div className="flex justify-between gap-2 mt-5">
          <button
            onClick={() => setIsDeleteOpen(false)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all w-full"
          >
            취소
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all w-full shadow-sm"
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
};
