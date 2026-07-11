import { ko } from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useMemo, useState } from 'react';
import { useApiClient } from '../../../../hooks/useApiClient';

// --- Mock Data ---
const MY_PLANS = [
    {
      id: 1,
      title: '서울 3박 4일 여행',
      destination: '서울특별시 종로구',
      duration: '3박 4일',
      startDate: '2024.03.15',
      endDate: '2024.03.18',
      schedule: [
        {
          day: 1,
          date: '2024.03.15',
          items: [
            { time: '10:00', place: '경복궁', description: '조선시대 궁궐 관람' },
            { time: '12:30', place: '토속촌 삼계탕', description: '점심식사' },
            { time: '14:00', place: '북촌한옥마을', description: '전통 한옥 거리 산책' },
          ],
        },
        {
          day: 2,
          date: '2024.03.16',
          items: [
            { time: '10:30', place: '코엑스 별마당 도서관', description: '포토존 및 카페' },
            { time: '14:00', place: '가로수길', description: '카페 투어' },
          ],
        },
      ],
    },
    {
      id: 2,
      title: '제주도 힐링 여행',
      destination: '제주특별자치도 제주시',
      duration: '4박 5일',
      startDate: '2024.04.01',
      endDate: '2024.04.05',
      schedule: [
        {
          day: 1,
          date: '2024.04.01',
          items: [
            { time: '11:00', place: '성산일출봉', description: '일출 명소' },
            { time: '14:00', place: '섭지코지', description: '해안 산책로' },
          ],
        },
      ],
    },
    {
      id: 3,
      title: '부산 바다 여행',
      destination: '부산광역시 해운대구',
      duration: '2박 3일',
      startDate: '2024.05.10',
      endDate: '2024.05.12',
      schedule: [
        {
          day: 1,
          date: '2024.05.10',
          items: [
            { time: '10:00', place: '해운대 해수욕장', description: '해변 산책' },
            { time: '15:00', place: '광안리', description: '광안대교 야경' },
          ],
        },
      ],
    },
  ];

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

  const tags = ['#뚜벅이최적화', '#극한의J', '#여유로운P', '#동선낭비없는'];

  useEffect(() => {
    const fetchTravels = async () => {
      try {
        const res = await apiRequest(`${BASE_URL}/api/travel`);
        if (res && res.travels) {
          setAvailableTravels(res.travels);
          const categories = Array.from(new Set(res.travels.map((t: any) => t.travelCategoryName))) as string[];
          setTravelCategories(categories);
          if (categories.length > 0) setSelectedCategory(categories[0]);
        }
      } catch (err) {
        console.error('Failed to fetch travels:', err);
      }
    };
    fetchTravels();
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

  const fetchMyPlans = async () => {
    setLoadingPlans(true);
    try {
      const data = await apiRequest(`${BASE_URL}/api/plan/my`);
      const allPlans = [...(data.myPlans || []), ...(data.editablePlans || [])];
      
      if (allPlans.length === 0) {
        setPlans(MY_PLANS);
      } else {
        setPlans(allPlans);
      }
    } catch (err) {
      console.error('플랜 로드 실패:', err);
      setPlans(MY_PLANS);
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
        const details = await apiRequest(`${BASE_URL}/api/plan/${plan.planId}/complete`);
        const { planFrame, timetables, placeBlocks } = details;
        
        const fullDestination = planFrame.travelCategoryName && planFrame.travelName 
          ? (planFrame.travelName.includes(planFrame.travelCategoryName) ? planFrame.travelName : `${planFrame.travelCategoryName} ${planFrame.travelName}`)
          : (planFrame.travelName || '');
        setDestination(fullDestination);
        
        if (timetables && timetables.length > 0) {
          const d = timetables.length;
          const n = Math.max(0, d - 1);
          setDays(d);
          setNights(n);
          setDuration(`${n}박 ${d}일`);
        }
        
        const scheduleData = timetables.map((tt: any, idx: number) => ({
          day: idx + 1,
          date: tt.date,
          items: placeBlocks
            .filter((pb: any) => pb.timeTableId === tt.timetableId)
            .sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''))
            .map((pb: any) => ({
              time: pb.startTime ? pb.startTime.substring(0, 5) : '00:00',
              place: pb.placeName,
              description: pb.placeAddress
            }))
        }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !destination || !duration) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    console.log('Submitted Blocks:', editor.document);
    
    alert('여행기가 성공적으로 작성되었습니다!');
    onSubmitCallback();
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
