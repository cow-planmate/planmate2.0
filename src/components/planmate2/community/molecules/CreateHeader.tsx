import { ArrowLeft, Send } from 'lucide-react';

interface CreateHeaderProps {
  title: string;
  onBack: () => void;
  onSubmit: () => void;
}

export const CreateHeader = ({ title, onBack, onSubmit }: CreateHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#1a1a1a]" />
        </button>
        <h1 className="text-xl font-bold text-[#1a1a1a]">{title}</h1>
      </div>
      <button
        onClick={onSubmit}
        className="flex items-center gap-2 px-4 py-2 bg-[#1344FF] text-white rounded-lg font-bold hover:bg-[#0d34cc] transition-all shadow-sm text-sm"
      >
        <Send className="w-4 h-4" />
        등록
      </button>
    </div>
  );
};
