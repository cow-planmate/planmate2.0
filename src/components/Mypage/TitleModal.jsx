import { useState } from "react";
import { useApiClient } from "../../hooks/useApiClient";
import { ErrorToast } from "../common/Toast";

export default function TitleModal({ onClose, id, currentTitle, onSuccess }) {
  const { patch, isAuthenticated } = useApiClient();
  const [newTitle, setNewTitle] = useState(currentTitle);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const handlePatchTitle = async () => {
    if (!isAuthenticated()) return;

    try {
      const response = await patch(`${BASE_URL}/api/plan/${id}/name`, {
        planName: newTitle,
      });

      if (response.edited === true) {
        onSuccess(newTitle);
        onClose();
      } else {
        const errorMessage =
          response.message || "패치에 실패했습니다. 다시 시도해주세요.";
        ErrorToast(errorMessage);
      }
    } catch (err) {
      console.error("패치에 실패했습니다:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-2">제목 변경</h2>
        <div className="my-6">
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
          >
            취소
          </button>
          <button
            onClick={handlePatchTitle}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-sm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
