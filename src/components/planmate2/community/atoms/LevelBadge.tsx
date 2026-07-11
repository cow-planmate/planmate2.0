interface LevelBadgeProps {
  level: number;
}

export const LevelBadge = ({ level }: LevelBadgeProps) => {
  const levels = [
    { level: 1, label: 'Lv.1', color: 'bg-gray-100 text-gray-600' },
    { level: 2, label: 'Lv.2', color: 'bg-blue-100 text-blue-600' },
    { level: 3, label: 'Lv.3', color: 'bg-purple-100 text-purple-600' },
    { level: 4, label: 'Lv.4', color: 'bg-orange-100 text-orange-600' },
    { level: 5, label: 'Lv.5', color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' },
  ];
  const levelInfo = levels.find(l => l.level === level) || levels[0];
  return (
    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${levelInfo.color}`}>
      {levelInfo.label}
    </span>
  );
};
