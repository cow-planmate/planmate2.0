import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreatePostLogic } from '../hooks/useCreatePostLogic';
import { CreatePostHeader } from '../molecules/CreatePostHeader';
import { BasicInfoSection } from '../organisms/BasicInfoSection';
import { PlanSelectionModal } from '../organisms/PlanSelectionModal';
import { PostEditorSection } from '../organisms/PostEditorSection';
import { SchedulePreview } from '../organisms/SchedulePreview';
import { TravelDetailsSection } from '../organisms/TravelDetailsSection';

interface CreatePostProps {
  onBack: () => void;
  onSubmit: () => void;
}

export default function CreatePost({ onBack, onSubmit }: CreatePostProps) {
  const logic = useCreatePostLogic(onSubmit);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      <CreatePostHeader onBack={onBack} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={logic.handleSubmit} className="space-y-6">
          <BasicInfoSection
            title={logic.title}
            setTitle={logic.setTitle}
            description={logic.description}
            setDescription={logic.setDescription}
            coverImage={logic.coverImage}
            setCoverImage={logic.setCoverImage}
            tags={logic.tags}
            selectedTags={logic.selectedTags}
            toggleTag={logic.toggleTag}
          />

          <TravelDetailsSection
            destination={logic.destination}
            setDestination={logic.setDestination}
            showDestinationSelector={logic.showDestinationSelector}
            setShowDestinationSelector={logic.setShowDestinationSelector}
            travelCategories={logic.travelCategories}
            selectedCategory={logic.selectedCategory}
            setSelectedCategory={logic.setSelectedCategory}
            availableTravels={logic.availableTravels}
            days={logic.days}
            nights={logic.nights}
            setDays={logic.setDays}
            setNights={logic.setNights}
            setDuration={logic.setDuration}
          />

          <PostEditorSection editor={logic.editor} />

          <SchedulePreview 
            schedule={logic.schedule} 
            onShowPlanModal={() => logic.setShowPlanModal(true)} 
          />

          {/* 제출 버튼 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-5 border border-[#e5e7eb] text-[#666666] rounded-2xl hover:bg-gray-50 transition-all font-bold text-lg"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-[2] py-5 bg-[#1344FF] text-white rounded-2xl hover:bg-[#0d34cc] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-100 font-black text-lg"
            >
              여행기 등록하기
            </button>
          </div>
        </form>
      </div>

      <PlanSelectionModal
        showPlanModal={logic.showPlanModal}
        setShowPlanModal={logic.setShowPlanModal}
        planSearch={logic.planSearch}
        setPlanSearch={logic.setPlanSearch}
        loadingPlans={logic.loadingPlans}
        filteredPlans={logic.filteredPlans}
        handlePlanSelect={logic.handlePlanSelect}
      />
    </div>
  );
}
