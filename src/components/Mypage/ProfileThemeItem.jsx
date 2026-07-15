import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faBed,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import ThemeStart from "./changeThemeStart";
import Theme from "./changeTheme";

export default function ProfileThemeItem({
  icon,
  title,
  content,
  change,
  iconColor,
}) {
  const [themeList, setThemeList] = useState(content);
  const [isThemeStartOpen, setIsThemeStartOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [selectedThemeKeywords, setSelectedThemeKeywords] = useState({});

  useEffect(() => {
    if (Array.isArray(content)) {
      const grouped = content.reduce((acc, theme) => {
        const id = theme.preferredThemeCategoryId;
        if (!acc[id]) acc[id] = [];
        acc[id].push(theme);
        return acc;
      }, {});
      setSelectedThemeKeywords(grouped);
    }
  }, [content]);

  const categoryNames = {
    0: "관광지",
    1: "숙소",
    2: "식당",
  };

  const categoryIcons = {
    0: faMapMarkerAlt,
    1: faBed,
    2: faUtensils,
  };

  const groupedThemes = themeList.reduce((acc, theme) => {
    const categoryId = theme.preferredThemeCategoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(theme);
    return acc;
  }, {});

  const handleThemeComplete = (keywords) => {
    setSelectedThemeKeywords(keywords);
    setIsThemeOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={icon} className={`w-4 h-4 ${iconColor}`} />
          <p className="font-semibold text-lg text-gray-800">{title}</p>
        </div>
        {change && (
          <button
            onClick={() => setIsThemeStartOpen(true)}
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

      {/* 선호테마 선택 모달 조율 */}
      {isThemeStartOpen && (
        <ThemeStart
          isOpen={isThemeStartOpen}
          onClose={() => setIsThemeStartOpen(false)}
          onThemeOpen={() => setIsThemeOpen(true)}
          selectedThemeKeywords={selectedThemeKeywords}
          onComplete={(selectedThemes) => {
            setThemeList(selectedThemes);
            setIsThemeStartOpen(false);
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
