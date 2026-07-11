import { useCommunityCreateLogic } from '../hooks/useCommunityCreateLogic';
import { CreateHeader } from '../molecules/CreateHeader';
import { GuidelineSection } from '../molecules/GuidelineSection';
import { EditorSection } from '../organisms/EditorSection';
import { ExtraFields } from '../organisms/ExtraFields';

interface CommunityCreatePageProps {
  type: 'free' | 'qna' | 'mate' | 'recommend';
  onBack: () => void;
  onSubmit: () => void;
}

export const CommunityCreatePage = ({ type, onBack, onSubmit }: CommunityCreatePageProps) => {
  const {
    title,
    setTitle,
    location,
    setLocation,
    rating,
    setRating,
    mateCount,
    setMateCount,
    editor,
    handleSubmit,
    getTips
  } = useCommunityCreateLogic(type, onSubmit);

  const getPageTitle = () => {
    switch (type) {
      case 'free': return '자유게시판 글쓰기';
      case 'qna': return 'Q&A 질문하기';
      case 'mate': return '메이트 찾기 글쓰기';
      case 'recommend': return '장소 추천 글쓰기';
      default: return '글쓰기';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 min-h-screen">
      <CreateHeader 
        title={getPageTitle()}
        onBack={onBack}
        onSubmit={handleSubmit}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-6 py-4 text-lg font-bold focus:outline-none placeholder:text-gray-300"
          />
        </div>

        <ExtraFields 
          type={type}
          location={location}
          setLocation={setLocation}
          rating={rating}
          setRating={setRating}
          mateCount={mateCount}
          setMateCount={setMateCount}
        />

        <EditorSection editor={editor} />
      </div>

      <GuidelineSection 
        type={type}
        tips={getTips()}
      />
    </div>
  );
};
