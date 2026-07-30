import { ko } from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useMemo, useState } from 'react';
import { useApiClient } from '../../../../hooks/useApiClient';
import { deleteImage, uploadImage, type ItineraryDay } from '../../community/api/communityApi';
import { useCreatePost } from '../../community/hooks/queries';
import { blocksToText } from '../../community/utils/blocksToText';
import { fileToDataUrl, resolveContentImages } from '../../community/utils/pendingImages';
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
      // 여행지 목록: Backend-v2 /api/destination (평면 {destinations:[{destinationId, destinationName}]})
      try {
        const res = await apiRequest(`${BASE_URL}/api/destination`);
        const list = res?.destinations ?? [];
        const travels = list.map((d: any) => ({
          travelId: d.destinationId,
          travelName: d.destinationName,
        }));
        setAvailableTravels(travels);
        // v2는 평면 목록이라 시/도 카테고리 계층이 없다
        setTravelCategories([]);
        setSelectedCategory('');
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

  // 삽입 시엔 서버에 올리지 않고 data: URL로만 둔다 (실제 업로드는 등록 시 resolveContentImages에서).
  // 등록하지 않고 이탈한 draft의 이미지가 MinIO에 고아로 남는 것을 방지한다.
  const uploadFile = async (file: File) => {
    try {
      return await fileToDataUrl(file);
    } catch (error) {
      alert(`이미지를 불러오지 못했습니다: ${(error as Error).message}`);
      throw error;
    }
  };

  const editor = useCreateBlockNote({
    dictionary: ko,
    initialContent,
    // '/이미지' 명령 및 이미지 삽입 → 커뮤니티 이미지 API (MinIO)
    uploadFile,
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
              // 좌표/카테고리/썸네일도 함께 담아야 여행기 상세의 일정 지도가 그려진다
              .map((pb: any) => ({
                time: blockStartTime(pb) ? blockStartTime(pb).substring(0, 5) : '00:00',
                place: pb.placeName,
                description: pb.placeAddress,
                lat: pb.latitude != null ? Number(pb.latitude) : null,
                lng: pb.longitude != null ? Number(pb.longitude) : null,
                category: pb.blockCategory ?? null,
                photoUrl: pb.placeThumbnailUrl ?? null,
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

    const uploadedUrls: string[] = [];
    try {
      const thumbnailUrl = await resolveThumbnailUrl();
      // 커버가 data: URL이었다면 이번에 새로 업로드된 것 → 실패 시 정리 대상
      if (thumbnailUrl && coverImage?.startsWith('data:')) {
        uploadedUrls.push(thumbnailUrl);
      }
      // 등록 시점에만 본문의 data: 이미지를 MinIO에 업로드해 URL로 교체한다
      const resolved = await resolveContentImages(editor.document as any[], uploadImage);
      uploadedUrls.push(...resolved.uploadedUrls);
      const blocks = resolved.blocks;
      const contentText = [description, blocksToText(blocks)].filter(Boolean).join('\n').trim();

      const itineraryDays: ItineraryDay[] = schedule.map((d: any) => ({
        day: d.day,
        date: d.date ?? null,
        items: (d.items ?? []).map((item: any) => ({
          time: item.time,
          place: item.place,
          description: item.description ?? null,
          lat: item.lat ?? null,
          lng: item.lng ?? null,
          category: item.category ?? null,
          photoUrl: item.photoUrl ?? null,
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
      // 등록 실패 시 방금 올린 커버/본문 이미지는 고아가 되므로 정리한다
      uploadedUrls.forEach((url) => deleteImage(url).catch(() => {}));
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
