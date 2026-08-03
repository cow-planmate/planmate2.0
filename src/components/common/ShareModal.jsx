import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "../../hooks/useApiClient";
import { ErrorToast, SuccessToast } from "./Toast";
import useConfirmStore from "../../store/Confirm";
import { Check, Copy, Link2, Lock } from "lucide-react";

const ShareModal = ({ setIsShareOpen, id, isOwner }) => {
  const { post, get, patch, del } = useApiClient();
  const [editors, setEditors] = useState([]);
  const [receiverNickname, setreceiverNickname] = useState("");
  const [shareURL, setShareURL] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [isUpdatingShare, setIsUpdatingShare] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { showConfirm } = useConfirmStore();

  const getEditors = useCallback(async () => {
    try {
      const response = await get(`${BASE_URL}/api/plan/${id}/editors`);
      console.log(response);
      setEditors(response.editors || []);
    } catch (error) {
      console.error("에디터 조회에 실패했습니다:", error);
    }
  }, [BASE_URL, get, id]);

  const getShareStatus = useCallback(async () => {
    try {
      const response = await get(`${BASE_URL}/api/plan/${id}/share`);
      const payload = response?.data || response;
      const nextIsShared = payload?.isShared === true;

      setIsShared(nextIsShared);
      setShareURL(
        nextIsShared
          ? `${window.location.origin}/complete?id=${encodeURIComponent(id)}`
          : "",
      );
    } catch (error) {
      ErrorToast(error.message || "공유 상태 조회에 실패했습니다.");
    }
  }, [BASE_URL, get, id]);

  useEffect(() => {
    getShareStatus();
    if (isOwner) {
      getEditors();
    }
  }, [getEditors, getShareStatus, isOwner]);

  const removeEditorAccessByOwner = async (targetUserId) => {
    if (!window.confirm("해당 사용자의 편집 권한을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await del(
        `${BASE_URL}/api/plan/${id}/editors/${targetUserId}`,
      );
      console.log(response);
      getEditors();
    } catch (err) {
      console.error("에디터 제거에 실패했습니다:", err);
    }
  };

  const inviteUserToPlan = async () => {
    try {
      const response = await post(`${BASE_URL}/api/plan/${id}/invite`, {
        receiverNickname: receiverNickname,
      });
      console.log(response);
      setreceiverNickname("");
      SuccessToast("초대를 보냈습니다.");
    } catch (err) {
      console.error("초대에 실패했습니다:", err);

      const errorMessage = err.message;
      ErrorToast(errorMessage);
    }
  };

  const toggleShare = async () => {
    const nextIsShared = !isShared;

    try {
      setIsUpdatingShare(true);
      await patch(`${BASE_URL}/api/plan/${id}/share`, {
        isShared: nextIsShared,
      });
      setIsShared(nextIsShared);
      setShareURL(
        nextIsShared
          ? `${window.location.origin}/complete?id=${encodeURIComponent(id)}`
          : "",
      );
      SuccessToast(
        nextIsShared ? "일정 공유를 켰습니다." : "일정 공유를 껐습니다.",
      );
    } catch (error) {
      ErrorToast(error.message || "공유 상태 변경에 실패했습니다.");
    } finally {
      setIsUpdatingShare(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareURL) {
      ErrorToast("현재 사용할 수 있는 공유 링크가 없습니다.");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareURL);
      setIsCopied(true);
      SuccessToast("링크가 복사되었습니다!");
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      ErrorToast("링크 복사에 실패했습니다.");
    }
  };

  const resignEditorAccess = async () => {
    if (await showConfirm("편집 권한을 포기하시겠습니까?")) {
      try {
        const response = await del(
          `${import.meta.env.VITE_API_URL}/api/plan/${id}/editor/me`,
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
        <div className="mb-6 border-b border-gray-100 pb-6">
          <h3 className="mb-3 text-sm font-medium text-gray-700">링크로 공유</h3>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  isShared
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isShared ? <Link2 size={18} /> : <Lock size={18} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  {isShared ? "링크가 있는 모든 사용자" : "제한됨"}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-gray-500">
                  {isShared
                    ? "링크를 아는 사람은 로그인 없이 완성된 일정을 볼 수 있어요."
                    : "초대받은 사용자만 일정에 접근할 수 있어요."}
                </p>
              </div>
              {isOwner && (
                <button
                  type="button"
                  role="switch"
                  aria-checked={isShared}
                  aria-label="공유 링크 사용"
                  disabled={isUpdatingShare}
                  onClick={toggleShare}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isShared ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      isShared ? "left-0.5 translate-x-5" : "left-0.5"
                    }`}
                  />
                </button>
              )}
            </div>

            {isShared && (
              <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4">
                <input
                  aria-label="완성본 공유 URL"
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none"
                  value={shareURL}
                  readOnly
                  onFocus={(event) => event.target.select()}
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isCopied
                      ? "bg-green-50 text-green-700"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  {isCopied ? "복사됨" : "링크 복사"}
                </button>
              </div>
            )}
          </div>
        </div>

        {isOwner && (
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
                    <span className="text-gray-700">{editor.nickname}</span>
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
          </div>
        )}

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

        {!isOwner && (
          <div className="mt-6">
            <button
              onClick={resignEditorAccess}
              className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-all duration-200 border border-red-200"
            >
              편집 권한 포기하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
