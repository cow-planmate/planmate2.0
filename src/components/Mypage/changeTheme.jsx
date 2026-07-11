import React, { useState, useEffect, useCallback } from "react";
import { useApiClient } from "../../hooks/useApiClient";
import { X, ChevronRight, ChevronLeft, Check, Compass, Utensils, Bed } from 'lucide-react';

export default function Theme({
  isOpen,
  onClose,
  onComplete,
  initialSelected = {},
}) {
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [allSelectedKeywords, setAllSelectedKeywords] = useState({});
  const [keywordsByStep, setKeywordsByStep] = useState([]);
  const [categories, setCategories] = useState([]);
  const { get } = useApiClient();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const getCategoryIcon = (catId) => {
    switch(catId) {
      case 0: return <Compass className="w-5 h-5" />;
      case 1: return <Bed className="w-5 h-5" />;
      case 2: return <Utensils className="w-5 h-5" />;
      default: return <Compass className="w-5 h-5" />;
    }
  };

  const getPreferredTheme = useCallback(async () => {
    try {
      const res = await get(`${BASE_URL}/api/user/preferredTheme`);

      const themeList = res.preferredThemes || [];

      if (Array.isArray(themeList) && themeList.length > 0) {
        const categoryMap = {};
        const categorizedKeywords = [];
        const categoryList = [];

        themeList.forEach((item) => {
          const catId = item.preferredThemeCategoryId;
          const catName = item.preferredThemeCategoryName;

          if (!categoryMap[catId]) {
            categoryMap[catId] = [];
            categoryList.push({
              id: catId,
              name: catName,
            });
          }
          categoryMap[catId].push(item);
        });

        categoryList.sort((a, b) => a.id - b.id);
        categoryList.forEach((cat) => {
          categorizedKeywords.push(categoryMap[cat.id] || []);
        });

        setCategories(categoryList);
        setKeywordsByStep(categorizedKeywords);

        setAllSelectedKeywords((prev) => {
          const hasInitial =
            prev && Object.values(prev).some((arr) => arr && arr.length > 0);

          if (hasInitial) return prev;

          const emptySelections = {};
          categoryList.forEach((cat) => {
            emptySelections[cat.id] = [];
          });
          return emptySelections;
        });
      } else {
        console.error("API 응답 형식이 올바르지 않습니다:", res);
      }
    } catch (err) {
      console.error("선호 테마 가져오기 실패:", err.message);
    }
  }, [BASE_URL, get]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setSelectedKeywords([]);

      if (initialSelected && Object.keys(initialSelected).length > 0) {
        setAllSelectedKeywords(initialSelected);
      } else {
        setAllSelectedKeywords({});
      }

      getPreferredTheme();
    }
  }, [isOpen, initialSelected, getPreferredTheme]);

  useEffect(() => {
    if (categories.length > 0 && keywordsByStep[currentStep]) {
      const currentCategoryId = categories[currentStep].id;
      const previousSelections = allSelectedKeywords[currentCategoryId] || [];

      const restoredIndexes = [];
      previousSelections.forEach((selectedItem) => {
        const index = keywordsByStep[currentStep].findIndex(
          (item) => item.preferredThemeId === selectedItem.preferredThemeId
        );
        if (index !== -1) {
          restoredIndexes.push(index);
        }
      });

      setSelectedKeywords(restoredIndexes);
    }
  }, [currentStep, categories, keywordsByStep, allSelectedKeywords]);

  if (!isOpen) return null;

  const toggleKeyword = (index) => {
    setSelectedKeywords((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : prev.length < 5
        ? [...prev, index]
        : prev
    );
  };

  const nextStep = () => {
    if (categories.length === 0 || !keywordsByStep[currentStep]) return;

    const currentCategoryId = categories[currentStep].id;
    const currentStepKeywords = keywordsByStep[currentStep];
    const selected = selectedKeywords
      .map((i) => currentStepKeywords[i])
      .filter((item) => !!item);

    setAllSelectedKeywords((prev) => ({
      ...prev,
      [currentCategoryId]: selected,
    }));

    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const final = {
        ...allSelectedKeywords,
        [currentCategoryId]: selected,
      };
      onComplete(final);
    }
  };

  const skipStep = () => {
    if (categories.length === 0) return;

    const currentCategoryId = categories[currentStep].id;
    setAllSelectedKeywords((prev) => ({
      ...prev,
      [currentCategoryId]: [],
    }));

    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const final = {
        ...allSelectedKeywords,
        [currentCategoryId]: [],
      };
      onComplete(final);
    }
  };

  const goToPreviousStep = () => {
    const currentCategoryId = categories[currentStep].id;
    const currentStepKeywords = keywordsByStep[currentStep];
    const selected = selectedKeywords
      .map((i) => currentStepKeywords[i])
      .filter((item) => !!item);

    setAllSelectedKeywords((prev) => ({
      ...prev,
      [currentCategoryId]: selected,
    }));

    setCurrentStep(currentStep - 1);
  };

  const currentKeywords = keywordsByStep[currentStep];
  const progress = categories.length > 0 ? ((currentStep + 1) / categories.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[120] font-pretendard">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Progress */}
        <div className="relative">
          <div className="p-6 pb-4 flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-[#1344FF] rounded-lg">
                {categories[currentStep] && getCategoryIcon(categories[currentStep].id)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  {categories.length > 0 && categories[currentStep]
                    ? `${categories[currentStep].name} 취향`
                    : "로딩 중..."}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">최대 5개까지 선택 가능</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-gray-100 w-full">
            <div
              className="h-full bg-[#1344FF] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          <div className="mb-6">
            <p className="text-[#1a1a1a] font-medium text-lg text-center">
              어떤 <span className="text-[#1344FF] underline underline-offset-4 decoration-2">키워드</span>를 좋아하시나요?
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {currentKeywords && Array.isArray(currentKeywords) ? (
              currentKeywords.map((keyword, index) => {
                const isSelected = selectedKeywords.includes(index);
                return (
                  <button
                    key={keyword.preferredThemeId}
                    onClick={() => toggleKeyword(index)}
                    className={`
                      relative group py-4 px-3 rounded-xl text-sm font-bold transition-all duration-200 border-2
                      flex flex-col items-center justify-center gap-2
                      ${isSelected
                        ? "bg-[#1344FF] border-[#1344FF] text-white shadow-lg scale-105"
                        : "bg-white border-gray-100 text-gray-600 hover:border-[#1344FF] hover:text-[#1344FF] hover:bg-blue-50/30"}
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="truncate w-full text-center">#{keyword.preferredThemeName}</span>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                 <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1344FF] border-t-transparent"></div>
                 <p className="text-sm">키워드를 불러오고 있어요...</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex items-center justify-between border-t border-gray-100">
          <button
            onClick={currentStep === 0 ? onClose : goToPreviousStep}
            className="px-5 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 0 ? "취소" : "이전"}
          </button>

          <div className="flex gap-2">
            <button
              onClick={skipStep}
              className="px-5 py-3 text-gray-400 hover:text-gray-600 font-medium transition-colors"
            >
              건너뛰기
            </button>
            <button
              onClick={nextStep}
              disabled={!currentKeywords}
              className="px-8 py-3 bg-[#1344FF] text-white font-bold rounded-xl hover:bg-[#0d34cc] transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === categories.length - 1 ? "선택 완료" : "다음 단계"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
