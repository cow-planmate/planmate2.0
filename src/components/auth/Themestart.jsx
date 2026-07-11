import { useState } from "react";
import { useApiClient } from "../../hooks/useApiClient";

export default function Themestart({
  isOpen = false,
  onClose = () => {},
  onThemeOpen = () => {},
  selectedThemeKeywords = {},
}) {
  const { post } = useApiClient();
  const [isSaving, setIsSaving] = useState(false);
  const categoryMap = {
    0: "관광지",
    1: "숙소",
    2: "식당",
  };
  const BASE_URL = import.meta.env.VITE_API_URL;

  if (!isOpen) return null;
  const savePreferredTheme = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const selectedIds = Object.values(selectedThemeKeywords)
        .flat()
        .map((item) => item.preferredThemeId); // ID만 추출
      await post(`${BASE_URL}/api/user/preferredTheme`, {
        preferredThemeIds: selectedIds,
      });

      onClose();
    } catch (err) {
      console.error("선호 테마 저장 실패:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const getThemeSelectionText = () => {
    const totalSelected = Object.values(selectedThemeKeywords).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );
    return totalSelected === 0 ? "선호테마 선택하기" : "선호테마 수정하기";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 font-pretendard">
      <div
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
          선호 테마 변경
        </h1>

        <div className="space-y-4">
          {Object.values(selectedThemeKeywords).some(
            (arr) => arr.length > 0,
          ) && (
            <div className="p-3 border bg-gray-100 border-blue-200 rounded-xl text-sm font-medium text-gray-600 shadow-sm">
              <div className="text-sm font-bold mb-2 text-gray-800">
                선택된 테마
              </div>
              <div className="space-y-1 text-sm">
                {Object.entries(selectedThemeKeywords).map(
                  ([categoryId, keywords]) =>
                    keywords.length > 0 ? (
                      <div key={categoryId} className="flex flex-wrap  gap-1">
                        <span className="font-bold text-gray-700">
                          {categoryMap[categoryId]}:
                        </span>
                        <span className="font-semibold text-gray-700">
                          {keywords.map((k) => k.preferredThemeName).join(", ")}
                        </span>
                      </div>
                    ) : null,
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onThemeOpen}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                Object.values(selectedThemeKeywords).some(
                  (arr) => arr.length > 0,
                )
                  ? "bg-main text-white border-main"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
            >
              {getThemeSelectionText()}
            </button>
            <button
              onClick={savePreferredTheme}
              disabled={isSaving}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isSaving
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-main text-white hover:bg-main/90"
              }`}
            >
              {isSaving ? "저장 중..." : "완료"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
