import { useState } from "react";

import { useApiClient } from "../../hooks/useApiClient";
import { X, Heart, Check, ChevronRight } from 'lucide-react';

export default function Themestart({
  isOpen,
  onClose,
  onThemeOpen,
  selectedThemeKeywords = {},
  onComplete,
}) {
  const { patch } = useApiClient();
  const categoryMap = {
    0: "관광지",
    1: "숙소",
    2: "식당",
  };
  const BASE_URL = import.meta.env.VITE_API_URL;
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const changePreferredTheme = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const selectedData = Object.values(selectedThemeKeywords || {})
        .flat()
        .filter((item) => item && item.preferredThemeId !== -1)
        .reduce((acc, item) => {
          const categoryId = item.preferredThemeCategoryId;
          const themeId = item.preferredThemeId;

          if (!acc[categoryId]) {
            acc[categoryId] = [];
          }
          acc[categoryId].push(themeId);
          return acc;
        }, {});

      const themeUpdates = Object.entries(selectedData).map(
        ([categoryId, themeIds]) => ({
          preferredThemeCategoryId: parseInt(categoryId),
          preferredThemeIds: themeIds,
        }),
      );

      console.log("themeUpdates:", themeUpdates);

      await patch(`${BASE_URL}/api/user/preferredThemes`, {
        themeUpdates,
      });

      onClose();

      if (onComplete) {
        const themesArray = Object.values(selectedThemeKeywords || {}).flat();
        onComplete(themesArray);
      }
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
    return totalSelected === 0 ? "선호테마 선택하기" : "선호테마 재선택하기";
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[110] font-pretendard"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#1344FF] fill-current" />
            <h1 className="text-xl font-bold text-gray-900">
              선호 테마 변경
            </h1>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {Object.values(selectedThemeKeywords).some(
            (arr) => Array.isArray(arr) && arr.length > 0,
          ) ? (
            <div className="space-y-6">
              <div className="p-3 border bg-gray-100 border-blue-200 rounded-xl text-sm font-medium text-gray-600 shadow-sm">
                <div className="text-sm font-bold mb-2 text-gray-800">
                  선택된 테마
                </div>

                <div className="space-y-4">
                  {Object.entries(selectedThemeKeywords).map(
                    ([categoryId, keywords]) =>
                      keywords.length > 0 ? (
                        <div key={categoryId} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1">
                             <Check className="w-3 h-3" />
                             {categoryMap[categoryId]}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {keywords.map((k) => (
                              <span key={k.preferredThemeId} className="px-3 py-1 bg-white text-[#1344FF] text-xs font-bold rounded-lg border border-blue-50 shadow-sm">
                                #{k.preferredThemeName}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null,
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-[#1344FF]">
                <Heart className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">설정된 테마가 없어요!</h3>
                <p className="text-gray-500 text-sm">나만의 여행 취향을 설정하고<br/>더 나은 추천을 받아보세요.</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onThemeOpen}
              className="flex-1 py-4 px-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              {getThemeSelectionText()}
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={changePreferredTheme}
              disabled={isSaving}
              className={`flex-1 py-4 px-4 font-bold rounded-xl transition-all shadow-lg ${
                isSaving
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#1344FF] text-white hover:bg-[#0d34cc]"
              }`}
            >
              {isSaving ? "저장 중..." : "변경 완료"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
