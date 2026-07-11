// ProfileText.jsx
import { useState, useEffect } from "react";
import { useApiClient } from "../../hooks/useApiClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ThemeStart from "./changeThemeStart";
import Theme from "./changeTheme";
import PasswordModal from "./PasswordModal";

import {
  faEye,
  faEyeSlash,
  faCheck,
  faUtensils,
  faBed,
  faMapMarkerAlt,
  faMars,
  faVenus,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { Check, X } from "lucide-react";

export default function ProfileText({
  icon,
  title,
  content,
  change,
  iconColor,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [naeyong, setNaeyong] = useState(content);
  const [isThemestartOpen, setIsThemestartOpen] = useState(false);
  const [selectedThemeKeywords, setSelectedThemeKeywords] = useState({});
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  useEffect(() => {
    if (title === "선호테마" && Array.isArray(content)) {
      const grouped = content.reduce((acc, theme) => {
        const id = theme.preferredThemeCategoryId;
        if (!acc[id]) acc[id] = [];
        acc[id].push(theme);
        return acc;
      }, {});
      setSelectedThemeKeywords(grouped);
    }
  }, [content, title]);

  // 성별 아이콘 결정 함수
  const getGenderIcon = (genderText) => {
    return genderText === "남자" ? faMars : faVenus;
  };

  // 표시할 아이콘 결정
  const displayIcon = title === "성별" ? getGenderIcon(naeyong) : icon;

  const handleThemestartOpen = () => {
    setIsThemestartOpen(true);
  };

  const handleThemestartClose = () => {
    setIsThemestartOpen(false);
  };

  const handleThemeOpen = () => {
    setIsThemeOpen(true);
  };

  const handleThemeClose = () => {
    setIsThemeOpen(false);
  };

  const handleThemeComplete = (keywords) => {
    setSelectedThemeKeywords(keywords);
    setIsThemeOpen(false);
  };

  let categoryNames = null;
  let groupedThemes = null;

  if (title == "선호테마") {
    categoryNames = {
      0: "관광지",
      1: "숙소",
      2: "식당",
    };

    // 카테고리 아이콘 매핑
    const categoryIcons = {
      0: faMapMarkerAlt, // 관광지
      1: faBed, // 숙도
      2: faUtensils, // 식당
    };

    // naeyong 사용 (content 대신)
    groupedThemes = naeyong.reduce((acc, theme) => {
      const categoryId = theme.preferredThemeCategoryId;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(theme);
      return acc;
    }, {});

    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={icon} className={`w-4 h-4 ${iconColor}`} />
            <p className="font-semibold text-lg text-gray-800">{title}</p>
          </div>
          {change && (
            <button
              onClick={() => handleThemestartOpen()}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              변경하기
            </button>
          )}
        </div>

        <div className="space-y-4">
          {Object.entries(groupedThemes).map(([categoryId, themes]) => (
            <div key={categoryId} className="space-y-2">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={categoryIcons[categoryId]}
                  className="w-4 h-4 text-gray-600"
                />
                <span className="font-medium text-gray-700">
                  {categoryNames[categoryId]}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 ml-6">
                {themes.map((theme) => (
                  <span
                    key={theme.preferredThemeId}
                    className="inline-block px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-sm font-medium text-blue-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    {theme.preferredThemeName}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 선호테마 선택 모달 */}
        {isThemestartOpen && (
          <ThemeStart
            isOpen={isThemestartOpen}
            onClose={handleThemestartClose}
            onThemeOpen={handleThemeOpen}
            selectedThemeKeywords={selectedThemeKeywords}
            onComplete={(selectedThemes) => {
              // 선택된 테마로 업데이트
              setNaeyong(selectedThemes);
              setIsThemestartOpen(false); // 수정: setIsModalOpen -> setIsThemestartOpen
            }}
          />
        )}

        <Theme
          isOpen={isThemeOpen}
          onComplete={handleThemeComplete}
          initialSelected={selectedThemeKeywords}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon
            icon={displayIcon}
            className={`w-4 h-4 ${iconColor}`}
          />
          <div className="flex-1">
            <span className="font-semibold text-lg text-gray-800">{title}</span>
            {title !== "비밀번호" && (
              <div className="text-gray-600 text-sm mt-1">{naeyong}</div>
            )}
          </div>
        </div>
        {title === "비밀번호" ? (
          <button
            onClick={() => setIsPasswordOpen(true)}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            변경하기
          </button>
        ) : (
          change && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              변경하기
            </button>
          )
        )}
      </div>

      {isModalOpen && (
        <Modal
          title={title}
          setIsModalOpen={setIsModalOpen}
          content={naeyong}
          setNaeyong={setNaeyong}
        />
      )}
      {isPasswordOpen && (
        <PasswordModal setIsPasswordOpen={setIsPasswordOpen} />
      )}
    </div>
  );
}

// Modal 컴포넌트 (나이, 성별 전용)
const Modal = ({ title, setIsModalOpen, content, setNaeyong }) => {
  const [selected, setSelected] = useState(content);
  const { patch, isAuthenticated } = useApiClient();
  const genderGubun = { 남자: 0, 여자: 1 };
  const BASE_URL = import.meta.env.VITE_API_URL;

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

  const age = (
    <div className="space-y-3 my-6">
      <p className="text-sm font-medium text-gray-700">나이 입력</p>
      <input
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
        value={selected}
        type="text"
        min={1}
        onChange={handleAgeChange}
        placeholder="나이를 입력하세요"
      />
    </div>
  );

  const gender = () => {
    return (
      <div className="space-y-3 my-6">
        <p className="text-sm font-medium text-gray-700">성별 선택</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelected("남자")}
            className={`py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200 ${selected === "남자"
              ? "bg-main text-white hover:bg-blue-800"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            남자
          </button>
          <button
            onClick={() => setSelected("여자")}
            className={`py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200 ${selected === "여자"
              ? "bg-main text-white hover:bg-blue-800"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            여자
          </button>
        </div>
      </div>
    );
  };

  const patchApi = async (title, data) => {
    if (isAuthenticated()) {
      try {
        if (title == "나이") {
          await patch(apiUrl[title], {
            age: data,
          });
        } else if (title == "성별") {
          await patch(apiUrl[title], {
            gender: genderGubun[data],
          });
        }
        setNaeyong(data);
        setIsModalOpen(false);
      } catch (err) {
        console.error("패치에 실패해버렸습니다:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title} 변경</h2>
        {title === "나이" ? age : title === "성별" ? gender() : null}
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
};
