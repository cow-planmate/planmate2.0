import { useEffect, useState } from "react";
import { useApiClient } from "../../hooks/useApiClient";
import { ErrorToast, SuccessToast } from "./Toast";
import useConfirmStore from "../../store/Confirm";

const ShareModal = ({ setIsShareOpen, id, isOwner }) => {
  const { post, get, del } = useApiClient();
  const [editors, setEditors] = useState([]);
  const [receiverNickname, setreceiverNickname] = useState("");
  const [shareURL, setShareURL] = useState("");
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { showConfirm } = useConfirmStore();

  useEffect(() => {
    getShareLink();
    if (isOwner) { getEditors(); }
  }, [id]);

  const removeEditorAccessByOwner = async (targetUserId) => {
    try {
      const response = await del(
        `${BASE_URL}/api/plan/${id}/editors/${targetUserId}`
      );
      console.log(response);
      getEditors();
    } catch (err) {
      console.error("에디터 제거에 실패했습니다:", err);
    }
  };

  const getEditors = async () => {
    try {
      const response = await get(`${BASE_URL}/api/plan/${id}/editors`);
      console.log(response);
      setEditors(response.simpleEditorVOs || []);
    } catch (error) {
      console.error("에디터 조회에 실패했습니다:", error);
    }
  };

  const inviteUserToPlan = async () => {
    try {
      const response = await post(`${BASE_URL}/api/plan/${id}/invite`, {
        receiverNickname: receiverNickname,
      });
      console.log(response);
      setreceiverNickname("");
      SuccessToast(response.message);
    } catch (err) {
      console.error("초대에 실패했습니다:", err);

      const errorMessage = err.message;
      ErrorToast(errorMessage);
    }
  };

  const getShareLink = async () => {
    try {
      const response = await get(`${BASE_URL}/api/plan/${id}/share`);
      setShareURL(response.sharedPlanUrl || "");
    } catch (error) {
      console.error("공유 링크 조회 실패", error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareURL);
    SuccessToast("링크가 복사되었습니다!");
  };

  const resignEditorAccess = async () => {
    if (await showConfirm("편집 권한을 포기하시겠습니까?")) {
      try {
        const response = await del(
          `${import.meta.env.VITE_API_URL}/api/plan/${id}/editor/me`
        );
        console.log(response);
        SuccessToast("편집 권한을 포기했습니다.");
        setIsShareOpen(false);

        window.location.reload();
      } catch (err) {
        console.error("편집 권한 포기에 실패했습니다:", err);
        ErrorToast("편집 권한 포기에 실패했습니다.");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative bg-white p-6 rounded-2xl shadow-2xl sm:w-96 w-[90vw] border border-gray-100 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6">공유 및 초대</h2>
        <button
          onClick={() => setIsShareOpen(false)}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            완성본 공유 URL
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
              value={shareURL}
              readOnly
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
            >
              복사
            </button>
          </div>
        </div>

        {isOwner &&
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              편집 권한이 있는 사용자
            </label>
            <div className="space-y-2">
              {editors.length > 0 ? (
                editors.map((editor) => (
                  <div
                    key={editor.userId}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-xl"
                  >
                    <span className="text-gray-700">{editor.nickName}</span>
                    <button
                      onClick={() => removeEditorAccessByOwner(editor.userId)}
                      className="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                    >
                      <span className="text-red-500 text-sm">×</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm text-center py-2">
                  편집 권한을 가진 사용자가 없습니다
                </div>
              )}
            </div>
          </div>}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            일정 편집 초대
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
              value={receiverNickname}
              onChange={(e) => setreceiverNickname(e.target.value)}
              placeholder="닉네임"
            />
            <button
              onClick={inviteUserToPlan}
              className="px-4 py-3 bg-main hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-sm"
              disabled={!receiverNickname.trim()}
            >
              초대
            </button>
          </div>
        </div>

        {!isOwner &&
          <div className="mt-6">
            <button
              onClick={resignEditorAccess}
              className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-all duration-200 border border-red-200"
            >
              편집 권한 포기하기
            </button>
          </div>
        }
      </div>
    </div>
  );
};

export default ShareModal;