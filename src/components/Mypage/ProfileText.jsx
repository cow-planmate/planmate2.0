import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMars, faVenus } from "@fortawesome/free-solid-svg-icons";
import AgeGenderModal from "./AgeGenderModal";
import PasswordModal from "./PasswordModal";
import ProfileThemeItem from "./ProfileThemeItem";

export default function ProfileText({
  icon,
  title,
  content,
  change,
  iconColor,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [fieldValue, setFieldValue] = useState(content); // naeyong 변수명을 표준 필드명으로 변경

  // 1. 단일 책임 원칙(SRP): 복잡한 테마 컴포넌트는 전용 컴포넌트로 완전히 위임하여 상호 결합도 파괴
  // 부모 컴포넌트인 Profile.jsx의 수정 없이 하위 확장성 확보 가능
  if (title === "선호테마") {
    return (
      <ProfileThemeItem
        icon={icon}
        title={title}
        content={content}
        change={change}
        iconColor={iconColor}
      />
    );
  }

  // 성별 아이콘 결정 함수
  const getGenderIcon = (genderText) => {
    return genderText === "남자" ? faMars : faVenus;
  };

  const displayIcon = title === "성별" ? getGenderIcon(fieldValue) : icon;

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
              <div className="text-gray-600 text-sm mt-1">{fieldValue}</div>
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

      {/* 나이, 성별 통합 변경 모달 모듈 독립 추출 */}
      {isModalOpen && (
        <AgeGenderModal
          title={title}
          setIsModalOpen={setIsModalOpen}
          content={fieldValue}
          setFieldValue={setFieldValue}
        />
      )}

      {/* 비밀번호 모달 */}
      {isPasswordOpen && (
        <PasswordModal setIsPasswordOpen={setIsPasswordOpen} />
      )}
    </div>
  );
}
