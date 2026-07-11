import { LucideIcon } from 'lucide-react';
import React from 'react';

interface StatItemProps {
  icon: LucideIcon;
  value: string | number;
  highlight?: boolean;
}

export const StatItem: React.FC<StatItemProps> = ({ icon: Icon, value, highlight = false }) => {
  return (
    <span className="flex items-center gap-0.5">
      <Icon className={`w-3 h-3 ${highlight ? 'text-[#1344FF]' : ''}`} />
      <span className={highlight ? 'text-[#1344FF] font-bold' : ''}>{value}</span>
    </span>
  );
};
