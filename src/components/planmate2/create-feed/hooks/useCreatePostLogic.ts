import { ko } from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useMemo, useState } from 'react';
import { useApiClient } from '../../../../hooks/useApiClient';
import {
  deleteImage,
  uploadImage,
  type ItineraryDay,
  type ItineraryPlanSnapshot,
} from '../../community/api/communityApi';
import { usePost, useCreatePost, useUpdatePost } from '../../community/hooks/queries';
import { blocksToText } from '../../community/utils/blocksToText';
import { fileToDataUrl, resolveContentImages } from '../../community/utils/pendingImages';
import { normalizeRegion } from '../../feed/utils/region';

export const useCreatePostLogic = (
  onSubmitCallback: () => void,
  /** 지정하면 수정 모드로 동작한다 (기존 여행기를 불러와 프리필 후 PATCH) */
  editPostId?: number | string
) => {
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
  // 읽는 사람이 이 일정을 "가져가기"로 복제할 수 있게 하는 플랜 스냅샷 (destinationId 등)
  const [planSnapshot, setPlanSnapshot] = useState<ItineraryPlanSnapshot | null>(null);
  // 블록 메모는 개인 기록일 수 있으므로 기본은 비공개, 켜야 스냅샷에 포함된다
  const [includeMemo, setIncludeMemo] = useState(false);

  const isEditMode = editPostId != null;
  const { data: existingPost } = usePost(isEditMode ? editPostId : undefined);
  const createPost = useCreatePost();
  const updatePost = useUpdatePost(Number(editPostId));

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

  // 수정 모드: 조회된 여행기를 폼과 에디터에 한 번만 채워 넣는다.
  // '간단 설명'은 등록 시 본문 맨 앞 블록으로 합쳐지므로 여기서는 비워둔다 (중복 방지).
  const [isPrefilled, setIsPrefilled] = useState(false);
  useEffect(() => {
    if (!isEditMode || !existingPost || isPrefilled) return;

    setTitle(existingPost.title ?? '');
    setDestination(existingPost.location || existingPost.region || '');
    setCoverImage(existingPost.image ?? null);
    setSelectedTags(existingPost.tags ?? []);
    setSourcePlanId(existingPost.sourcePlanId ?? null);
    // 수정 시 plan 스냅샷을 다시 담지 않으면 저장과 동시에 가져가기가 불가능해진다
    setPlanSnapshot(existingPost.itinerary?.plan ?? null);
    setIncludeMemo((existingPost.itinerary?.days ?? []).some(
      (d) => (d.items ?? []).some((item) => item.memo != null)
    ));

    const d = existingPost.durationDays ?? 1;
    const n = Math.max(0, d - 1);
    setDays(d);
    setNights(n);
    setDuration(`${n}박 ${d}일`);

    setSchedule(existingPost.itinerary?.days ?? []);

    const blocks = existingPost.content as any[];
    if (Array.isArray(blocks) && blocks.length > 0) {
      editor.replaceBlocks(editor.document, blocks);
    }
    setIsPrefilled(true);
  }, [isEditMode, existingPost, isPrefilled, editor]);

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

        // 가져가기가 이 스냅샷만으로 플랜을 새로 만든다 → POST /api/plan/full의 planFrame을 그대로 보존
        setPlanSnapshot(
          planFrame.destinationId != null
            ? {
                destinationId: Number(planFrame.destinationId),
                destinationName: travelName || null,
                transportationType: planFrame.transportationType,
                adultCount: planFrame.adultCount ?? 0,
                childCount: planFrame.childCount ?? 0,
              }
            : null
        );

        if (timetables && timetables.length > 0) {
          const d = timetables.length;
          const n = Math.max(0, d - 1);
          setDays(d);
          setNights(n);
          setDuration(`${n}박 ${d}일`);
        }
        
        // v2 필드명: timeTableId / blockStartTime (레거시: timetableId / startTime)
        const blockStartTime = (pb: any) => pb.blockStartTime ?? pb.startTime ?? '';
        const blockEndTime = (pb: any) => pb.blockEndTime ?? pb.endTime ?? '';
        const hhmm = (v: string) => (v ? v.substring(0, 5) : '');
        const scheduleData = timetables.map((tt: any, idx: number) => {
          const timetableId = tt.timeTableId ?? tt.timetableId;
          return {
            day: idx + 1,
            date: tt.date,
            startTime: hhmm(tt.timeTableStartTime ?? '') || null,
            endTime: hhmm(tt.timeTableEndTime ?? '') || null,
            items: placeBlocks
              .filter((pb: any) => (pb.timeTableId ?? pb.timetableId) === timetableId)
              .sort((a: any, b: any) => blockStartTime(a).localeCompare(blockStartTime(b)))
              // 좌표/카테고리/썸네일은 상세의 일정 지도용,
              // placeId·주소·종료시각·메모는 가져가기가 블록을 그대로 복원하는 데 쓰인다
              .map((pb: any) => ({
                time: hhmm(blockStartTime(pb)) || '00:00',
                endTime: hhmm(blockEndTime(pb)) || null,
                place: pb.placeName,
                description: pb.placeAddress,
                lat: pb.latitude != null ? Number(pb.latitude) : null,
                lng: pb.longitude != null ? Number(pb.longitude) : null,
                category: pb.blockCategory ?? null,
                photoUrl: pb.placeThumbnailUrl ?? null,
                placeId: pb.placeId ?? null,
                placeContentTypeId: pb.placeContentTypeId ?? null,
                placeAddress: pb.placeAddress ?? null,
                placeCopyrightDivCd: pb.placeCopyrightDivCd ?? null,
                memo: pb.memo ?? null,
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
      // '간단 설명'은 본문 블록 맨 앞에 넣는다. contentText에만 담으면 상세에서 블록을 렌더할 때 사라진다.
      const blocks = description.trim()
        ? [
            { type: 'paragraph', content: [{ type: 'text', text: description.trim(), styles: {} }] },
            ...resolved.blocks,
          ]
        : resolved.blocks;
      const contentText = blocksToText(blocks).trim();

      const itineraryDays: ItineraryDay[] = schedule.map((d: any) => ({
        day: d.day,
        date: d.date ?? null,
        startTime: d.startTime ?? null,
        endTime: d.endTime ?? null,
        items: (d.items ?? []).map((item: any) => ({
          time: item.time,
          endTime: item.endTime ?? null,
          place: item.place,
          description: item.description ?? null,
          lat: item.lat ?? null,
          lng: item.lng ?? null,
          category: item.category ?? null,
          photoUrl: item.photoUrl ?? null,
          placeId: item.placeId ?? null,
          placeContentTypeId: item.placeContentTypeId ?? null,
          placeAddress: item.placeAddress ?? item.description ?? null,
          placeCopyrightDivCd: item.placeCopyrightDivCd ?? null,
          // 메모는 작성자가 공개를 켠 경우에만 내보낸다
          ...(includeMemo && item.memo ? { memo: item.memo } : {}),
        })),
      }));

      const itinerary =
        itineraryDays.length > 0 ? { plan: planSnapshot, days: itineraryDays } : null;

      const payload = {
        title,
        content: blocks,
        contentText,
        thumbnailUrl,
        region: normalizeRegion(destination),
        location: destination,
        durationDays: days,
      };

      if (isEditMode) {
        // 수정에서는 일정·태그를 비울 수 있어야 하므로 항상 명시적으로 보낸다
        await updatePost.mutateAsync({
          ...payload,
          itinerary,
          tags: selectedTags,
        });
      } else {
        await createPost.mutateAsync({
          ...payload,
          category: 'feed',
          itinerary: itinerary ?? undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          sourcePlanId: sourcePlanId ?? undefined,
        });
      }

      alert(isEditMode ? '여행기가 수정되었습니다!' : '여행기가 성공적으로 작성되었습니다!');
      onSubmitCallback();
    } catch (err) {
      // 저장 실패 시 방금 올린 커버/본문 이미지는 고아가 되므로 정리한다
      uploadedUrls.forEach((url) => deleteImage(url).catch(() => {}));
      alert(`여행기 ${isEditMode ? '수정' : '등록'}에 실패했습니다: ${(err as Error).message}`);
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
    includeMemo, setIncludeMemo,
    // plan 스냅샷이 없으면 다른 사용자가 이 일정을 가져갈 수 없다 (작성 화면에서 안내)
    isForkable: planSnapshot?.destinationId != null,
    tags,
    editor,
    isEditMode,
    isSubmitting: createPost.isPending || updatePost.isPending,
    toggleTag,
    handlePlanSelect,
    filteredPlans,
    handleSubmit
  };
};
