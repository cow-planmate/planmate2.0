// components/NicknameModal.jsx
import { useState } from "react";
import { useApiClient } from "../../hooks/useApiClient";
import useNicknameStore from "../../store/Nickname";
import { SuccessToast, ErrorToast } from "../common/Toast";

export default function NicknameModal({
  setIsNicknameModalOpen,
  currentNickname,
  onNicknameUpdate,
}) {
  const [nickname, setNickname] = useState(currentNickname);
  const { patch, isAuthenticated } = useApiClient();
  const BASE_URL = import.meta.env.VITE_API_URL;
  const setGlobalNickname = useNicknameStore((state) => state.setNickname);

  const handleNicknameChange = async () => {
    if (isAuthenticated()) {
      try {
        const response = await patch(`${BASE_URL}/api/user/nickname`, {
          nickname,
        });
        setGlobalNickname(nickname);
        onNicknameUpdate(nickname);
        setIsNicknameModalOpen(false);
        SuccessToast(response.message);
      } catch (err) {
        console.error("닉네임 변경에 실패했습니다:", err);

        if (err.message) {
          ErrorToast(err.message);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-2">닉네임 변경</h2>
        <div className="space-y-3 my-6">
          <p className="text-sm font-medium text-gray-700">새 닉네임 입력</p>
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="새 닉네임을 입력하세요"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setIsNicknameModalOpen(false)}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
          >
            취소
          </button>
          <button
            onClick={handleNicknameChange}
            className="px-4 py-2.5 bg-main hover:bg-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow-sm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
