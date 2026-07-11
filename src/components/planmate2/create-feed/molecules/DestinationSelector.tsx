import { MapPin, Search, X } from 'lucide-react';
import React from 'react';

interface DestinationSelectorProps {
  destination: string;
  setDestination: (val: string) => void;
  showDestinationSelector: boolean;
  setShowDestinationSelector: (val: boolean) => void;
  travelCategories: string[];
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  availableTravels: any[];
}

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  destination,
  setDestination,
  showDestinationSelector,
  setShowDestinationSelector,
  travelCategories,
  selectedCategory,
  setSelectedCategory,
  availableTravels,
}) => {
  return (
    <div className="lg:col-span-3">
      <label className="block text-sm font-bold text-[#444444] mb-3 flex items-center gap-2 h-5">
        <MapPin className="w-4 h-4 text-[#1344FF]" />
        여행지 선택 <span className="text-red-500">*</span>
      </label>
      
      <div className="relative">
        <div 
          className={`relative border-b-2 transition-all pb-2 flex items-center h-[46px] ${
            showDestinationSelector ? 'border-[#1344FF]' : 'border-[#e5e7eb]'
          }`}
        >
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onFocus={() => setShowDestinationSelector(true)}
            placeholder="어디로 여행을 다녀오셨나요?"
            className="w-full bg-transparent text-lg font-medium placeholder-[#cccccc] focus:outline-none text-[#1a1a1a]"
          />
          <Search className={`shrink-0 w-6 h-6 transition-colors ${
            showDestinationSelector ? 'text-[#1344FF]' : 'text-[#999999]'
          }`} />
        </div>

        {showDestinationSelector && (
          <>
            <div 
              className="fixed inset-0 z-20" 
              onClick={() => setShowDestinationSelector(false)} 
            />
            <div className="absolute top-full left-0 right-0 mt-3 z-30 bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#efefef] animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black text-[#1344FF] uppercase tracking-widest">어디로 떠나시나요?</span>
                <button 
                  type="button"
                  onClick={() => setShowDestinationSelector(false)}
                  className="bg-gray-100 p-2 rounded-full text-[#999999] hover:text-[#1a1a1a] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-100">
                {travelCategories.slice(0, 10).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-200 ${
                      selectedCategory === cat 
                      ? 'bg-[#1344FF] text-white shadow-lg shadow-blue-100' 
                      : 'bg-white text-[#666666] border border-[#e5e7eb] hover:border-[#1344FF] hover:text-[#1344FF]'
                    }`}
                  >
                    {cat.replace('특별시', '').replace('광역시', '').replace('특별자치도', '').replace('특별자치시', '')}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => {
                      setDestination(selectedCategory);
                      setShowDestinationSelector(false);
                    }}
                    className={`px-3 py-3 rounded-2xl text-[13px] font-bold transition-all border ${
                      destination === selectedCategory
                      ? 'bg-[#1344FF] border-[#1344FF] text-white shadow-md'
                      : 'bg-white border-[#f3f4f6] text-[#444444] hover:bg-blue-50 hover:border-blue-100 hover:text-[#1344FF]'
                    }`}
                  >
                    {selectedCategory.replace('특별시', '').replace('광역시', '')} 전체
                  </button>
                  {availableTravels
                    .filter(t => t.travelCategoryName === selectedCategory)
                    .map(t => {
                      const fullDest = `${selectedCategory} ${t.travelName}`;
                      const isSelected = destination === fullDest;
                      return (
                        <button
                          key={t.travelId}
                          type="button"
                          onClick={() => {
                            setDestination(fullDest);
                            setShowDestinationSelector(false);
                          }}
                          className={`px-3 py-3 rounded-2xl text-[13px] font-bold transition-all border ${
                            isSelected
                            ? 'bg-[#1344FF] border-[#1344FF] text-white shadow-md'
                            : 'bg-white border-[#f3f4f6] text-[#444444] hover:bg-blue-50 hover:border-blue-100 hover:text-[#1344FF]'
                          }`}
                        >
                          {t.travelName}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
