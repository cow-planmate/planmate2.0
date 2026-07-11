import React, { useState } from "react";

function App() {
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "좋아하는 관광지 키워드를 선택해주세요!",
    "좋아하는 숙소 키워드를 선택해주세요!",
    "좋아하는 식당 키워드를 선택해주세요!",
  ];

  const keywordsByStep = [
    // 관광지 키워드
    [
      "고즈넉",
      "웅장함",
      "활기찬",
      "평화로운",
      "신비로운",
      "아름다운",
      "전통적",
      "모던한",
      "자연적",
      "도시적",
      "역사적",
      "문화적",
      "낭만적",
      "모험적",
      "휴식적",
      "교육적",
      "가족적",
      "친근한",
    ],
    // 숙소 키워드
    [
      "깔끔한",
      "럭셔리",
      "아늑한",
      "편안한",
      "조용한",
      "뷰가좋은",
      "접근성좋은",
      "가성비좋은",
      "서비스좋은",
      "시설좋은",
      "분위기좋은",
      "안전한",
      "넓은",
      "모던한",
      "전통적",
      "독특한",
      "로맨틱",
      "패밀리",
    ],
    // 식당 키워드
    [
      "맛있는",
      "저렴한",
      "분위기좋은",
      "서비스좋은",
      "신선한",
      "전통적",
      "퓨전",
      "건강한",
      "매운",
      "달콤한",
      "고급스러운",
      "캐주얼",
      "로컬맛집",
      "유명한",
      "뷰맛집",
      "데이트",
      "가족식사",
      "혼밥",
    ],
  ];

  const toggleKeyword = (index) => {
    setSelectedKeywords((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else if (prev.length < 5) {
        return [...prev, index];
      }
      return prev;
    });
  };

  const nextStep = () => {
    if (selectedKeywords.length > 0) {
      // 여기서 API 전송 로직 구현
      console.log(
        `${steps[currentStep]} 선택된 키워드:`,
        selectedKeywords.map((i) => keywordsByStep[currentStep][i])
      );

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        setSelectedKeywords([]);
      } else {
        // 마지막 단계 완료
        console.log("키워드 선택 완료!");
      }
    }
  };

  const skipStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedKeywords([]);
    } else {
      console.log("키워드 선택 완료!");
    }
  };

  const currentKeywords = keywordsByStep[currentStep];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-pretendard">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-lg font-bold text-gray-900 text-center mb-6">
          {steps[currentStep]}
        </h1>

        <div className="max-h-[40rem] overflow-y-auto mb-6">
          <div className="grid grid-cols-3 gap-3">
            {currentKeywords.map((keyword, index) => (
              <button
                key={index}
                onClick={() => toggleKeyword(index)}
                className={`relative rounded-full aspect-square flex flex-col items-center justify-center transition-all ${
                  selectedKeywords.includes(index) ? "ring-4 ring-blue-500" : ""
                }`}
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-700 mt-1">{keyword}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mb-4">
          {selectedKeywords.length}/5 선택됨
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={skipStep}
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
          >
            건너뛰기
          </button>

          <div className="flex space-x-2">
            {currentStep > 0 && (
              <button
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                  setSelectedKeywords([]);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                이전
              </button>
            )}
            <button
              onClick={nextStep}
              disabled={selectedKeywords.length === 0}
              className={`px-4 py-2 rounded-lg ${
                selectedKeywords.length > 0
                  ? "bg-main text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {currentStep === steps.length - 1 ? "완료" : "다음"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
