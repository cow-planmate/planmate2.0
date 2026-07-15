import { useState } from "react";
import { useApiClient } from "../../hooks/useApiClient";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function AgeGenderModal({
  title,
  setIsModalOpen,
  content,
  setFieldValue,
}) {
  const [selected, setSelected] = useState(content);
  const { patch, isAuthenticated } = useApiClient();

  const genderGubun = { 남자: 0, 여자: 1 };

  const apiUrl = {
    나이: `${BASE_URL}/api/user/age`,
    성별: `${BASE_URL}/api/user/gender`,
  };

  const handleAgeChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setSelected("");
      return;
    }
    if (/^\d+$/.test(value) && value !== "0") {
      setSelected(value);
    }
  };

  const patchApi = async (title, data) => {
    if (!isAuthenticated()) return;

    try {
      if (title === "나이") {
        await patch(apiUrl[title], {
          age: data,
        });
      } else if (title === "성별") {
        await patch(apiUrl[title], {
          gender: genderGubun[data],
        });
      }
      setFieldValue(data);
      setIsModalOpen(false);
    } catch (err) {
      console.error("정보 수정 패치에 실패했습니다:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title} 변경</h2>

        {title === "나이" ? (
          <div className="space-y-3 my-6">
            <p className="text-sm font-medium text-gray-700">나이 입력</p>
            <input
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
              value={selected}
              type="text"
              onChange={handleAgeChange}
              placeholder="나이를 입력하세요"
            />
          </div>
        ) : title === "성별" ? (
          <div className="space-y-3 my-6">
            <p className="text-sm font-medium text-gray-700">성별 선택</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelected("남자")}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                  selected === "남자"
                    ? "bg-main text-white hover:bg-blue-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                남자
              </button>
              <button
                onClick={() => setSelected("여자")}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                  selected === "여자"
                    ? "bg-main text-white hover:bg-blue-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                여자
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
          >
            취소
          </button>
          <button
            onClick={() => patchApi(title, selected)}
            className="px-4 py-2.5 bg-main hover:bg-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow-sm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
