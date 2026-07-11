import { useState } from "react";
import { SuccessToast } from "./Toast";

export default function FeedbackModal({ isOpen, onClose }) {
  const [content, setContent] = useState("");
  const BASE_URL = import.meta.env.VITE_API_URL;

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      const response = await fetch(`${BASE_URL}/api/beta/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      });

      const data = await response.json();
      console.log("서버 응답:", data);
      if (!response.ok) {
        throw new Error("서버 응답 실패");
      }

      SuccessToast("피드백이 성공적으로 전송되었습니다. 감사합니다!");
    } catch (error) {
      console.error("에러 발생:", error);
    }

    console.log("피드백 내용:", content);

    setContent("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">피드백 보내기</h2>

        <textarea
          className="w-full h-32 border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-main"
          placeholder="불편한 점이나 개선 아이디어를 적어주세요 :)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded-lg bg-main text-white hover:opacity-90"
          >
            보내기
          </button>
        </div>
      </div>
    </div>
  );
}
