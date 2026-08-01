import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreatePostLogic } from '../hooks/useCreatePostLogic';
import { CreatePostHeader } from '../molecules/CreatePostHeader';
import { BasicInfoSection } from '../organisms/BasicInfoSection';
import { PlanSelectionModal } from '../organisms/PlanSelectionModal';
import { PostEditorSection } from '../organisms/PostEditorSection';
import { TravelDetailsSection } from '../organisms/TravelDetailsSection';

interface CreatePostProps {
  onBack: () => void;
  onSubmit: () => void;
  /** 지정하면 수정 모드 */
  editPostId?: number | string;
}

export default function CreatePost({ onBack, onSubmit, editPostId }: CreatePostProps) {
  const logic = useCreatePostLogic(onSubmit, editPostId);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      <CreatePostHeader onBack={onBack} isEditMode={logic.isEditMode} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={logic.handleSubmit} className="space-y-6">
          <BasicInfoSection title={logic.title} setTitle={logic.setTitle} />

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
            schedule={logic.schedule}
            onShowPlanModal={() => logic.setShowPlanModal(true)}
            includeMemo={logic.includeMemo}
            setIncludeMemo={logic.setIncludeMemo}
            isForkable={logic.isForkable}
          />

          <PostEditorSection editor={logic.editor} />

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
              disabled={logic.isSubmitting}
              className="flex-[2] py-5 bg-[#1344FF] text-white rounded-2xl hover:bg-[#0d34cc] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-100 font-black text-lg disabled:opacity-50 disabled:hover:scale-100"
            >
              {logic.isEditMode ? '수정 완료' : '피드 등록하기'}
            </button>
          </div>
        </form>
      </div>

      <PlanSelectionModal
        showPlanModal={logic.showPlanModal}
        onClose={logic.closePlanModal}
        planSearch={logic.planSearch}
        setPlanSearch={logic.setPlanSearch}
        loadingPlans={logic.loadingPlans}
        filteredPlans={logic.filteredPlans}
        onPreviewPlan={logic.previewPlan}
        pendingPlan={logic.pendingPlan}
        loadingPlanPreview={logic.loadingPlanPreview}
        onConfirm={logic.confirmPlanSelection}
        onCancelPreview={logic.cancelPlanPreview}
      />
    </div>
  );
}
