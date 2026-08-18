import { MapPin, Users } from 'lucide-react';

interface ExtraFieldsProps {
  type: 'free' | 'qna' | 'mate' | 'recommend';
  location: string;
  setLocation: (val: string) => void;
  rating: string;
  setRating: (val: string) => void;
  mateCount: string;
  setMateCount: (val: string) => void;
}

export const ExtraFields = ({
  type,
  location,
  setLocation,
  rating,
  setRating,
  mateCount,
  setMateCount
}: ExtraFieldsProps) => {
  if (type === 'mate') {
    return (
      <div className="flex border-b border-gray-50 bg-blue-50/20">
        <div className="flex-1 border-r border-gray-100 flex items-center px-6 py-3 gap-2">
          <MapPin className="w-4 h-4 text-[#1344FF]" />
          <input
            type="text"
            placeholder="여행 희망 지역"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-transparent text-sm font-medium focus:outline-none w-full placeholder:text-blue-300"
          />
        </div>
        <div className="flex items-center px-6 py-3 gap-3">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#1344FF]" />
            <span className="text-sm font-bold text-gray-700 whitespace-nowrap">모집 인원</span>
          </div>
          <select 
            value={mateCount}
            onChange={(e) => setMateCount(e.target.value)}
            className="bg-transparent text-sm font-bold text-[#1344FF] focus:outline-none cursor-pointer"
          >
            {[2, 3, 4, 5, 6, 7, 8].map(n => (
              <option key={n} value={n}>{n}명</option>
            ))}
            <option value="unlimited">인원 제한 없음</option>
          </select>
        </div>
      </div>
    );
  }

  return null;
};
