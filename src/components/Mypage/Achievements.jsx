import {
    faAward,
    faCommentDots,
    faMapMarkedAlt,
    faRoute,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const achievementList = [
  {
    id: 1,
    title: "첫 걸음",
    description: "첫 여행 플랜을 생성했습니다.",
    icon: faAward,
    color: "text-amber-500",
    unlocked: true,
  },
  {
    id: 2,
    title: "계획의 달인",
    description: "5개 이상의 플랜을 생성했습니다.",
    icon: faRoute,
    color: "text-blue-500",
    unlocked: true,
  },
  {
    id: 3,
    title: "베스트 파트너",
    description: "공동 편집자로 3회 이상 참여했습니다.",
    icon: faUsers,
    color: "text-green-500",
    unlocked: false,
  },
  {
    id: 4,
    title: "전국 제패",
    description: "5개 이상의 광역시도에 방문했습니다.",
    icon: faMapMarkedAlt,
    color: "text-purple-500",
    unlocked: false,
  },
  {
    id: 5,
    title: "열혈 리뷰어",
    description: "피드백을 1회 이상 작성했습니다.",
    icon: faCommentDots,
    color: "text-pink-500",
    unlocked: true,
  },
];

export default function Achievements() {
  const unlockedCount = achievementList.filter((a) => a.unlocked).length;
  const progress = (unlockedCount / achievementList.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full flex flex-col mt-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800">내 업적</h3>
          <span className="text-sm font-medium text-blue-600">
            {unlockedCount} / {achievementList.length}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {achievementList.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex items-center p-4 rounded-xl border ${
                achievement.unlocked
                  ? "bg-white border-gray-100 shadow-sm"
                  : "bg-gray-50 border-gray-100 opacity-60"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                  achievement.unlocked ? "bg-gray-50" : "bg-gray-100"
                }`}
              >
                <FontAwesomeIcon
                  icon={achievement.icon}
                  className={`text-xl ${
                    achievement.unlocked ? achievement.color : "text-gray-400"
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-bold ${
                      achievement.unlocked ? "text-gray-800" : "text-gray-500"
                    }`}
                  >
                    {achievement.title}
                  </h4>
                  {achievement.unlocked && (
                    <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold">
                      달성
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {achievement.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
