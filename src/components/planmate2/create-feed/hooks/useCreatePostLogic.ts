import { ko } from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useMemo, useState } from 'react';
import { useApiClient } from '../../../../hooks/useApiClient';
import { uploadImage, type ItineraryDay } from '../../community/api/communityApi';
import { useCreatePost } from '../../community/hooks/queries';
import { blocksToText } from '../../community/utils/blocksToText';
import { normalizeRegion } from '../../feed/utils/region';

export const useCreatePostLogic = (onSubmitCallback: () => void) => {
  const { apiRequest } = useApiClient();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [nights, setNights] = useState(0);
  const [days, setDays] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [availableTravels, setAvailableTravels] = useState<any[]>([]);
  const [travelCategories, setTravelCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('서울특별시');
  const [showDestinationSelector, setShowDestinationSelector] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planSearch, setPlanSearch] = useState('');
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [sourcePlanId, setSourcePlanId] = useState<string | null>(null);
  const createPost = useCreatePost();

  const tags = ['#뚜벅이최적화', '#극한의J', '#여유로운P', '#동선낭비없는'];

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        // Backend-v2: 여행지 목록은 /api/destination (구 /api/travel). 평면 목록 {destinations:[{destinationId, destinationName}]}
        const res = await apiRequest(`${BASE_URL}/api/destination`);
        // 구 Backend(/api/travel) 응답(res.travels)과도 호환
        const list = res?.destinations ?? res?.travels ?? [];
        const travels = list.map((d: any) => ({
          travelId: d.destinationId ?? d.travelId,
          travelName: d.destinationName ?? d.travelName,
          travelCategoryName: d.travelCategoryName, // v2엔 없음(평면) → undefined
        }));
        setAvailableTravels(travels);
        // 카테고리(시/도) 계층이 있으면 유지(레거시), 없으면 평면 목록으로 노출(v2)
        const categories = Array.from(
          new Set(travels.map((t: any) => t.travelCategoryName).filter(Boolean))
        ) as string[];
        setTravelCategories(categories);
        setSelectedCategory(categories.length > 0 ? categories[0] : '');
      } catch (err) {
        console.error('Failed to fetch destinations:', err);
      }
    };
    fetchDestinations();
  }, []);
  
  useEffect(() => {
    if (duration) {
      const match = duration.match(/(\d+)박\s*(\d+)일/);
      if (match) {
        setNights(parseInt(match[1]));
        setDays(parseInt(match[2]));
      }
    }
  }, [duration]);

  const initialContent = useMemo(() => [
    {
      type: "paragraph",
      content: [],
    },
  ], []);

  const editor = useCreateBlockNote({
    dictionary: ko,
    initialContent,
  });

  useEffect(() => {
    if (showPlanModal) {
      fetchMyPlans();
    }
  }, [showPlanModal]);

  // Backend-v2: 내 플랜 목록은 프로필 응답에 포함된다 (구 /api/plan/my 는 없음)
  const fetchMyPlans = async () => {
    setLoadingPlans(true);
    try {
      const data = await apiRequest(`${BASE_URL}/api/user/profile`);
      const allPlans = [...(data?.myPlans ?? []), ...(data?.editablePlans ?? [])];
      // 소유 + 편집권한 플랜이 겹칠 수 있으므로 planId 기준 중복 제거
      const unique = Array.from(
        new Map(allPlans.map((p: any) => [p.planId, p])).values()
      );
      setPlans(unique);
    } catch (err) {
      console.error('플랜 로드 실패:', err);
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handlePlanSelect = async (plan: any) => {
    if (plan.planId) {
      try {
        setSourcePlanId(plan.planId);
        const details = await apiRequest(`${BASE_URL}/api/plan/${plan.planId}/complete`);
        const { planFrame, timetables, placeBlocks } = details;
        
        // v2: destinationName(평면), 레거시: travelCategoryName + travelName(계층)
        const travelName = planFrame.destinationName ?? planFrame.travelName ?? '';
        const fullDestination = planFrame.travelCategoryName && travelName
          ? (travelName.includes(planFrame.travelCategoryName) ? travelName : `${planFrame.travelCategoryName} ${travelName}`)
          : travelName;
        setDestination(fullDestination);
        
        if (timetables && timetables.length > 0) {
          const d = timetables.length;
          const n = Math.max(0, d - 1);
          setDays(d);
          setNights(n);
          setDuration(`${n}박 ${d}일`);
        }
        
        // v2 필드명: timeTableId / blockStartTime (레거시: timetableId / startTime)
        const blockStartTime = (pb: any) => pb.blockStartTime ?? pb.startTime ?? '';
        const scheduleData = timetables.map((tt: any, idx: number) => {
          const timetableId = tt.timeTableId ?? tt.timetableId;
          return {
            day: idx + 1,
            date: tt.date,
            items: placeBlocks
              .filter((pb: any) => (pb.timeTableId ?? pb.timetableId) === timetableId)
              .sort((a: any, b: any) => blockStartTime(a).localeCompare(blockStartTime(b)))
              .map((pb: any) => ({
                time: blockStartTime(pb) ? blockStartTime(pb).substring(0, 5) : '00:00',
                place: pb.placeName,
                description: pb.placeAddress
              }))
          };
        });
        setSchedule(scheduleData);
      } catch (err) {
        console.error('플랜 상세 정보 로드 실패:', err);
      }
    } else {
      setDestination(plan.destination);
      setDuration(plan.duration);
      
      const match = plan.duration.match(/(\d+)박\s*(\d+)일/);
      if (match) {
        setNights(parseInt(match[1]));
        setDays(parseInt(match[2]));
      }
      
      setSchedule(plan.schedule);
    }
    setShowPlanModal(false);
  };

  const filteredPlans = plans.filter(plan => 
    (plan.planName || plan.title || '').toLowerCase().includes(planSearch.toLowerCase()) ||
    (plan.destination || '').toLowerCase().includes(planSearch.toLowerCase())
  );

  // 커버 이미지가 data URL이면 MinIO에 업로드해 공개 URL로 교체
  const resolveThumbnailUrl = async (): Promise<string | undefined> => {
    if (!coverImage) return undefined;
    if (!coverImage.startsWith('data:')) return coverImage;
    const blob = await (await fetch(coverImage)).blob();
    const ext = blob.type.split('/')[1] || 'png';
    const file = new File([blob], `cover.${ext}`, { type: blob.type });
    return uploadImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !destination || !duration) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      const thumbnailUrl = await resolveThumbnailUrl();
      const blocks = editor.document as any[];
      const contentText = [description, blocksToText(blocks)].filter(Boolean).join('\n').trim();

      const itineraryDays: ItineraryDay[] = schedule.map((d: any) => ({
        day: d.day,
        date: d.date ?? null,
        items: (d.items ?? []).map((item: any) => ({
          time: item.time,
          place: item.place,
          description: item.description ?? null,
        })),
      }));

      await createPost.mutateAsync({
        category: 'feed',
        title,
        content: blocks,
        contentText,
        thumbnailUrl,
        region: normalizeRegion(destination),
        location: destination,
        durationDays: days,
        itinerary: itineraryDays.length > 0 ? { days: itineraryDays } : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        sourcePlanId: sourcePlanId ?? undefined,
      });

      alert('여행기가 성공적으로 작성되었습니다!');
      onSubmitCallback();
    } catch (err) {
      alert(`여행기 등록에 실패했습니다: ${(err as Error).message}`);
    }
  };

  return {
    title, setTitle,
    description, setDescription,
    destination, setDestination,
    duration, setDuration,
    nights, setNights,
    days, setDays,
    selectedTags, setSelectedTags,
    coverImage, setCoverImage,
    availableTravels,
    travelCategories,
    selectedCategory, setSelectedCategory,
    showDestinationSelector, setShowDestinationSelector,
    showPlanModal, setShowPlanModal,
    planSearch, setPlanSearch,
    plans,
    loadingPlans,
    schedule,
    tags,
    editor,
    toggleTag,
    handlePlanSelect,
    filteredPlans,
    handleSubmit
  };
};
