import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiClient } from '../../../../hooks/useApiClient';
import useKakaoLoader from '../../../../hooks/useKakaoLoader';
import useNicknameStore from '../../../../store/Nickname';
import { LEVEL_CONFIG, REGION_COORDINATES } from '../constants';
import { useCalendar } from '../hooks/useCalendar';
import { usePlanChecklists } from '../hooks/usePlanChecklists';
import { useUserStats } from '../hooks/useUserStats';
import {
  FORKED_TRAVEL_POSTS,
  LIKED_COMMUNITY_POSTS,
  LIKED_TRAVEL_POSTS,
  MY_COMMUNITY_POSTS,
  MY_TRAVEL_POSTS,
  FRIENDS_LIST,
  CHAT_ROOMS
} from '../mockData';
import { CalendarSection } from '../organisms/CalendarSection';
import { CommunityActivitySection } from '../organisms/CommunityActivitySection';
import { MapSection } from '../organisms/MapSection';
import { MyPageModals } from '../organisms/MyPageModals';
import { ProfileHeader } from '../organisms/ProfileHeader';
import { TravelLogsSection } from '../organisms/TravelLogsSection';
import { TripSection } from '../organisms/TripSection';
import { SocialSection } from '../organisms/SocialSection';
import { ChatModal } from '../../social/molecules/ChatModal';

// @ts-ignore
import gravatarUrl from "../../../../utils/gravatarUrl";
// @ts-ignore
import ThemeStart from "../../../Mypage/changeThemeStart";
// @ts-ignore
import Theme from "../../../Mypage/changeTheme";

interface MyPageProps {
  onNavigate: (view: any, data?: any) => void;
  userId?: string;
}

export default function MyPage({ onNavigate, userId }: MyPageProps) {
  useKakaoLoader();
  const navigate = useNavigate();
  
  // 현재 로그인한 사용자인지 확인
  const currentLoggedInUserId = localStorage.getItem('userId');
  const isOtherUser = userId && userId !== currentLoggedInUserId;

  // Tabs State
  const [travelTab, setTravelTab] = useState<'created' | 'forked' | 'liked'>('created');
  const [communityTab, setCommunityTab] = useState<'my_posts' | 'liked_posts'>('my_posts');
  
  const [date, setDate] = useState<Date>(new Date());
  
  // API 관련 상태
  const { get, patch, del, isAuthenticated, logout } = useApiClient();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [myPlans, setMyPlans] = useState<any[]>([]);
  const [editablePlans, setEditablePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 인증 체크
  useEffect(() => {
    if (!isAuthenticated()) {
      alert("로그인 시에만 접근 가능한 페이지입니다.");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // 체크리스트 관리 Hook
  const {
    planChecklists,
    handleToggleChecklist,
    handleUpdateChecklistText,
    handleAddChecklistItem,
    handleDeleteChecklistItem
  } = usePlanChecklists(myPlans, editablePlans);

  // 모달 상태
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [newNickname, setNewNickname] = useState('');
  const [isNicknameVerified, setIsNicknameVerified] = useState(false);
  const [nicknameValid, setNicknameValid] = useState<boolean | null>(null);
  const [nicknameMessage, setNicknameMessage] = useState('');
  const [newAge, setNewAge] = useState<number>(0);
  const [newGender, setNewGender] = useState<number>(0);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 테마 관리 상태
  const [isThemeStartOpen, setIsThemeStartOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [selectedThemeKeywords, setSelectedThemeKeywords] = useState<any>({
    0: [],
    1: [],
    2: [],
  });

  // 다중 삭제 관리 상태
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedPlanIds, setSelectedPlanIds] = useState<number[]>([]);

  const handleFriendAdd = async () => {
    if (!isAuthenticated()) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }
    try {
      // 실제 API가 있을 경우: await post(`${BASE_URL}/api/friends`, { friendId: userId });
      alert(`${userProfile?.nickName || '사용자'}님에게 친구 요청을 보냈습니다.`);
    } catch (err) {
      alert("친구 요청 중 오류가 발생했습니다.");
    }
  };

  const handleSendMessage = (targetUser?: any) => {
    if (!isAuthenticated()) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }
    
    // 이 핸들러는 이제 부모로부터 받은 전역 채팅 함수를 호출하거나 
    // 여기 프로필 사용자를 넘겨야 합니다 (현재는 팝업 준비중 메시지 대신 전역 처리 필요)
    // onNavigate를 통해 부모의 전역 핸들러를 호출하도록 유도하거나 
    // props로 직접 전달받아야 하지만, 현재 구조상 팝업은 부모가 관리하므로 
    // 여기서 알림만 띄우거나 기능을 유지하려면 props 수정이 필요합니다.
    alert(`${targetUser?.nickName || userProfile?.nickname || '사용자'}님과의 채팅을 시작합니다.`);
  };

  // 캘린더 이벤트 팝업 상태
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<any>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (newNickname === userProfile?.nickname) {
      setIsNicknameVerified(true);
      setNicknameValid(null);
      setNicknameMessage('');
    } else {
      setIsNicknameVerified(false);
      setNicknameValid(null);
      setNicknameMessage('');
    }
  }, [newNickname, userProfile?.nickname]);

  const BASE_URL = (import.meta as any).env.VITE_API_URL;
  const setStoreNickname = useNicknameStore((state: any) => (state as any).setNickname);

  // User Level & EXP Hook
  const stats = {
    forks: editablePlans.length,    // 공유받은 일정
    feedPosts: 0,
    community: 0,
    comments: 0,
    attendance: 10 + (myPlans.length * 5) // 임시 점수 (플랜당 5점)
  };
  const { 
    exp, 
    userLevel, 
    levelName, 
    displayMax, 
    remainingCount 
  } = useUserStats(stats);

  const handleLogout = () => {
    logout();
    setStoreNickname('');
    navigate('/');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        alert("프로필 이미지가 변경되었습니다. (데모)");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckNickname = async () => {
    if (!newNickname || newNickname.trim() === '') {
      setNicknameMessage('닉네임을 입력해주세요.');
      setNicknameValid(false);
      return;
    }
    
    if (newNickname === userProfile?.nickname) {
      setNicknameMessage('현재 사용 중인 닉네임입니다.');
      setNicknameValid(true);
      setIsNicknameVerified(true);
      return;
    }

    try {
      // @ts-ignore
      const response = await post(`${BASE_URL}/api/auth/register/nickname/verify`, { nickname: newNickname });
      if (response.isAvailable) {
        setNicknameMessage('사용 가능한 닉네임입니다.');
        setNicknameValid(true);
        setIsNicknameVerified(true);
      } else {
        setNicknameMessage('이미 사용 중인 닉네임입니다.');
        setNicknameValid(false);
        setIsNicknameVerified(false);
      }
    } catch (err) {
      console.error("닉네임 중복 확인 실패:", err);
      setNicknameMessage('중복 확인 중 오류가 발생했습니다.');
      setNicknameValid(false);
    }
  };

  const handleProfileSubmit = async () => {
    try {
      const updates = [];
      
      // 닉네임 변경
      if (newNickname && newNickname !== userProfile?.nickname) {
        updates.push(patch(`${BASE_URL}/api/user/nickname`, { nickname: newNickname }));
      }
      
      // 나이 변경 (Backend expectant of 'age' being a number)
      if (newAge !== userProfile?.age) {
        updates.push(patch(`${BASE_URL}/api/user/age`, { age: Number(newAge) }));
      }
      
      // 성별 변경
      if (newGender !== userProfile?.gender) {
        updates.push(patch(`${BASE_URL}/api/user/gender`, { gender: newGender }));
      }

      if (updates.length > 0) {
        await Promise.all(updates);
        if (newNickname !== userProfile?.nickname) {
          setStoreNickname(newNickname);
        }
        alert("프로필 정보가 성공적으로 업데이트되었습니다.");
        
        // 프로필 정보 다시 가져오기
        const profileData = await get(`${BASE_URL}/api/user/profile`);
        setUserProfile(profileData);
      }
      
      setActiveModal(null);
    } catch (err: any) {
      console.error("프로필 업데이트 실패:", err);
      alert(err.response?.data?.message || "프로필 변경에 실패했습니다.");
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword) {
      alert("현재 비밀번호를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    // 비밀번호 검증 (최소 8자, 영문, 숫자, 특수문자 조합)
    const hasEnglish = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    
    if (newPassword.length < 8 || newPassword.length > 20 || !hasEnglish || !hasNumber || !hasSpecialChar) {
      alert("비밀번호 형식이 올바르지 않습니다. (8~20자 영문, 숫자, 특수문자 조합)");
      return;
    }

    try {
      await patch(`${BASE_URL}/api/auth/password`, { 
        oldPassword: currentPassword,
        password: newPassword,
        confirmPassword: confirmPassword
      });
      alert("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
      handleLogout();
    } catch (err: any) {
      console.error("비밀번호 변경 실패:", err);
      alert(err.response?.data?.message || "비밀번호 변경에 실패했습니다.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await del(`${BASE_URL}/api/user/account`);
      alert("회원 탈퇴가 완료되었습니다.");
      handleLogout();
    } catch (err) {
      console.error("회원 탈퇴 실패:", err);
      alert("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  const handleDeletePlan = async (planId: number, isOwner: boolean) => {
    if (!confirm(isOwner ? "여행 일정을 완전히 삭제하시겠습니까?" : "공유된 일정에서 나가시겠습니까?")) return;

    try {
      if (isOwner) {
        await del(`${BASE_URL}/api/plan/${planId}`);
      } else {
        await del(`${BASE_URL}/api/plan/${planId}/editor/me`);
      }
      
      // 로컬 상태 업데이트
      if (isOwner) {
        setMyPlans(prev => prev.filter((p: any) => p.planId !== planId));
      } else {
        setEditablePlans(prev => prev.filter((p: any) => p.planId !== planId));
      }
      
      alert(isOwner ? "일정이 삭제되었습니다." : "일정에서 나갔습니다.");
    } catch (err) {
      console.error("일정 삭제 실패:", err);
      alert("일정 삭제에 실패했습니다.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPlanIds.length === 0) {
      alert("삭제할 일정을 선택해주세요.");
      return;
    }
    
    const count = selectedPlanIds.length;
    if (!confirm(`선택한 ${count}개의 일정을 삭제하시겠습니까?\n(본인 일정은 삭제되고, 초대된 일정은 나가기 처리됩니다)`)) return;

    try {
      const ownedToDelete = allPlans.filter(p => selectedPlanIds.includes(p.id) && p.isOwner).map(p => p.id);
      const sharedToLeave = allPlans.filter(p => selectedPlanIds.includes(p.id) && !p.isOwner).map(p => p.id);

      // 1. 소유한 일정 벌크 삭제
      if (ownedToDelete.length > 0) {
        // useApiClient의 del은 두번째 인자가 config/body일 수 있음. 
        // fetch option에 body를 실어보내야 함.
        // @ts-ignore
        await del(`${BASE_URL}/api/plan`, { planIds: ownedToDelete });
        setMyPlans(prev => prev.filter((p: any) => !ownedToDelete.includes(p.planId)));
      }

      // 2. 공유받은 일정 개별 나가기 (백엔드 벌크가 없으므로 루프)
      if (sharedToLeave.length > 0) {
        await Promise.all(sharedToLeave.map(id => del(`${BASE_URL}/api/plan/${id}/editor/me`)));
        setEditablePlans(prev => prev.filter((p: any) => !sharedToLeave.includes(p.planId)));
      }

      alert("선택한 일정이 처리되었습니다.");
      setIsDeleteMode(false);
      setSelectedPlanIds([]);
    } catch (err) {
      console.error("일괄 삭제 실패:", err);
      alert("일정 처리 중 오류가 발생했습니다.");
    }
  };

  const toggleSelectAll = () => {
    if (selectedPlanIds.length === allPlans.length) {
      setSelectedPlanIds([]);
    } else {
      setSelectedPlanIds(allPlans.map(p => p.id));
    }
  };

  const togglePlanSelection = (id: number) => {
    setSelectedPlanIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated() || isOtherUser) {
        try {
          setLoading(true);
          const endpoint = isOtherUser ? `${BASE_URL}/api/user/profile/${userId}` : `${BASE_URL}/api/user/profile`;
          
          let profileData;
          try {
            profileData = await get(endpoint);
          } catch (err) {
            if (isOtherUser) {
              profileData = {
                nickname: `사용자${userId}`,
                email: `user${userId}@example.com`,
                myPlanVOs: [],
                editablePlanVOs: [],
                preferredThemes: []
              };
            } else {
              throw err;
            }
          }
          
          if (!profileData) {
            console.error("No profile data received");
            return;
          }

          setUserProfile(profileData);
          setMyPlans(profileData.myPlanVOs || []);
          setEditablePlans(profileData.editablePlanVOs || []);

          // 테마 데이터도 상태에 미리 담아둡니다
          if (profileData.preferredThemes && Array.isArray(profileData.preferredThemes)) {
            const categorized: any = { 0: [], 1: [], 2: [] };
            profileData.preferredThemes.forEach((theme: any) => {
              const catId = theme.preferredThemeCategoryId;
              if (categorized[catId] !== undefined) {
                categorized[catId].push(theme);
              }
            });
            setSelectedThemeKeywords(categorized);
          }
        } catch (err) {
          console.error("프로필 정보를 가져오는데 실패했습니다:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId, isOtherUser, isAuthenticated, get]);

  // userProfile이 변경될 때마다 테마 선택 상태 동기화
  useEffect(() => {
    if (userProfile?.preferredThemes) {
      const categorized: any = { 0: [], 1: [], 2: [] };
      const themes = Array.isArray(userProfile.preferredThemes)
        ? userProfile.preferredThemes
        : typeof userProfile.preferredThemes === 'string'
          ? userProfile.preferredThemes.split(',').filter(Boolean)
          : [];
      
      themes.forEach((theme: any) => {
        if (typeof theme === 'object' && theme !== null) {
          const catId = theme.preferredThemeCategoryId;
          if (categorized[catId] !== undefined) {
            categorized[catId].push(theme);
          } else {
            categorized[0].push(theme);
          }
        } else if (typeof theme === 'string') {
          categorized[0].push({
            preferredThemeCategoryId: 0,
            preferredThemeName: theme.trim(),
            preferredThemeId: -1
          });
        }
      });
      setSelectedThemeKeywords(categorized);
    }
  }, [userProfile]);

  // 플랜 데이터를 V2 UI 형식으로 변환
  const allPlans = [
    ...myPlans.map(p => ({ ...p, isOwner: true })), 
    ...editablePlans.map(p => ({ ...p, isOwner: false }))
  ].map(plan => {
    const hasDates = plan.startDate && plan.endDate;
    
    // 타임존 영향을 받지 않도록 날짜 객체 생성 및 시간 초기화
    const startDate = hasDates ? new Date(plan.startDate) : null;
    if (startDate) startDate.setHours(0, 0, 0, 0);
    
    const endDate = hasDates ? new Date(plan.endDate) : null;
    if (endDate) endDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dDayStr = 'D-Day';
    if (startDate) {
      const diffTime = startDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      dDayStr = diffDays === 0 ? 'D-Day' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
    }

    const isPast = hasDates && endDate && endDate < today;
    const isOngoing = hasDates && !isPast && (startDate && startDate <= today);

    return {
      id: plan.planId,
      title: plan.planName,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(),
      dateStr: hasDates ? `${plan.startDate} - ${plan.endDate}` : '날짜 확인 필요',
      duration: plan.duration,
      dDay: dDayStr,
      status: isPast ? '완료' : (isOngoing ? '진행 중' : '예정됨'),
      hasDates: hasDates,
      theme: plan.isOwner ? 'blue' : 'orange',
      isOwner: plan.isOwner,
      progress: Math.floor(Math.random() * 100), 
      checklist: planChecklists[plan.planId] || []
    };
  });

  // 캘린더 일정이 일직선으로 이어지도록 레인(Lane) 계산
  const eventsWithLanes = (() => {
    const sorted = [...allPlans].sort((a, b) => {
      const startA = a.startDate.getTime();
      const startB = b.startDate.getTime();
      if (startA !== startB) return startA - startB;
      return (b.endDate.getTime() - b.startDate.getTime()) - (a.endDate.getTime() - a.startDate.getTime());
    });

    const lanes: number[] = [];
    return sorted.map(plan => {
      const start = plan.startDate.getTime();
      const end = plan.endDate.getTime();
      
      let laneIndex = lanes.findIndex(laneEnd => laneEnd < start);
      if (laneIndex === -1) {
        laneIndex = lanes.length;
        lanes.push(end);
      } else {
        lanes[laneIndex] = end;
      }
      return { ...plan, lane: laneIndex };
    });
  })();

  const ongoingPlans = allPlans.filter(plan => plan.status === '진행 중');
  const upcomingPlans = allPlans.filter(plan => plan.status === '예정됨');
  const pastPlans = allPlans.filter(plan => plan.status === '완료');

  const SCHEDULED_TRIPS = [...ongoingPlans, ...upcomingPlans];
  const PAST_TRIPS = pastPlans;

  const totalLikes = 0;

  // 지도용 데이터 가공 (지역별 그룹화)
  const groupedPlansByRegion = [...myPlans, ...editablePlans].reduce((acc: any, plan: any) => {
    const region = plan.region || '서울';
    if (!acc[region]) {
      acc[region] = {
        name: region,
        count: 0,
        plans: [],
        coords: REGION_COORDINATES[region] || REGION_COORDINATES['서울']
      };
    }
    acc[region].count += 1;
    acc[region].plans.push(plan);
    return acc;
  }, {});

  // 캘린더 관련 Hook
  const {
    handlePrevMonth,
    handleNextMonth,
    gridCells,
    getEventsForDate,
    currentYear,
    currentMonth,
  } = useCalendar(date, setDate, eventsWithLanes);

  const getCommunityBadge = (type: string) => {
    switch(type) {
      case 'free': return <span className="bg-blue-100 text-[#1344FF] text-xs px-2 py-0.5 rounded-full font-bold">자유</span>;
      case 'qna': return <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-bold">Q&A</span>;
      case 'mate': return <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full font-bold">메이트</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1344FF]"></div>
      </div>
    );
  }

  const dummyUser = {
    nickName: userProfile?.nickname || '사용자',
    email: userProfile?.email || '로그인이 필요합니다',
    profileLogo: profileImage || gravatarUrl(userProfile?.email || ''),
    gender: userProfile?.gender,
    age: userProfile?.age,
    preferredThemes: userProfile?.preferredThemes
  };

  const userStats = {
    userLevel,
    level: levelName,
    exp,
    expToNext: remainingCount,
    maxExp: displayMax,
    progress: Math.min(100, (exp / displayMax) * 100),
    stats: stats
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileHeader 
          dummyUser={dummyUser}
          userStats={userStats}
          onEditProfile={() => {
            setNewNickname(userProfile?.nickname || '');
            setNewAge(userProfile?.age || 0);
            setNewGender(userProfile?.gender || 0);
            setNewPassword('');
            setConfirmPassword('');
            setActiveModal('profile');
          }}
          onViewLevel={() => setActiveModal('level')}
          onAddFriend={handleFriendAdd}
          onSendMessage={handleSendMessage}
          myPlansCount={myPlans.length}
          editablePlansCount={editablePlans.length}
          isOtherUser={isOtherUser}
        />

        {!isOtherUser && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <CalendarSection
                currentYear={currentYear}
                currentMonth={currentMonth}
                onSetDate={setDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onToday={() => setDate(new Date())}
                gridCells={gridCells}
                getEventsForDate={getEventsForDate}
                onEventClick={(event) => {
                  setSelectedCalendarEvent(event);
                  setActiveModal('eventDetail');
                }}
              />

              <MapSection
                allPlansCount={allPlans.length}
                groupedPlansByRegion={groupedPlansByRegion}
              />
            </div>

            <TripSection
              isDeleteMode={isDeleteMode}
              selectedPlanIds={selectedPlanIds}
              toggleSelectAll={toggleSelectAll}
              allPlans={allPlans}
              handleBulkDelete={handleBulkDelete}
              setIsDeleteMode={setIsDeleteMode}
              ongoingPlans={ongoingPlans}
              upcomingPlans={upcomingPlans}
              pastPlans={pastPlans}
              togglePlanSelection={togglePlanSelection}
              handleDeletePlan={handleDeletePlan}
              handleToggleChecklist={handleToggleChecklist}
              handleUpdateChecklistText={handleUpdateChecklistText}
              handleDeleteChecklistItem={handleDeleteChecklistItem}
              handleAddChecklistItem={handleAddChecklistItem}
              onNavigateTrip={(id: number) => navigate(`/complete?id=${id}`)}
              onNavigateToPlanMaker={() => onNavigate('plan-maker')}
            />
          </>
        )}

        <TravelLogsSection
          travelTab={travelTab}
          setTravelTab={setTravelTab}
          myTravelPosts={MY_TRAVEL_POSTS}
          forkedTravelPosts={FORKED_TRAVEL_POSTS}
          likedTravelPosts={LIKED_TRAVEL_POSTS}
          onNavigateDetail={(post) => onNavigate('detail', { post })}
        />

        <CommunityActivitySection
          communityTab={communityTab === 'my_posts' ? 'written' : 'liked'}
          setCommunityTab={(tab) => setCommunityTab(tab === 'written' ? 'my_posts' : 'liked_posts')}
          myCommunityPosts={MY_COMMUNITY_POSTS}
          likedCommunityPosts={LIKED_COMMUNITY_POSTS}
          myComments={[]}
        />
      </div>

      <MyPageModals
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        newNickname={newNickname}
        setNewNickname={setNewNickname}
        newAge={newAge}
        setNewAge={setNewAge}
        newGender={newGender}
        setNewGender={setNewGender}
        isNicknameVerified={isNicknameVerified}
        nicknameValid={nicknameValid}
        nicknameMessage={nicknameMessage}
        handleCheckNickname={handleCheckNickname}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        handlePasswordUpdate={handlePasswordUpdate}
        handleNicknameUpdate={handleProfileSubmit}
        handleImageUpload={handleImageChange}
        dummyUser={dummyUser}
        userStats={userStats}
        LEVEL_CONFIG={LEVEL_CONFIG}
        handleDeleteAccount={handleDeleteAccount}
        selectedDateEvents={selectedCalendarEvent ? [selectedCalendarEvent] : []}
        onNavigateDetail={(event) => {
          navigate(`/complete?id=${event.id}`);
          setActiveModal(null);
        }}
        onOpenThemeEditor={() => {
          setIsThemeStartOpen(true);
          setActiveModal(null);
        }}
      />

      {/* 테마 수정 모달들 (기존 컴포넌트 유지) */}
      {isThemeStartOpen && (
        <ThemeStart
          isOpen={isThemeStartOpen}
          onClose={async () => {
            setIsThemeStartOpen(false);
            try {
              const profileData = await get(`${BASE_URL}/api/user/profile`);
              setUserProfile(profileData);
            } catch (err) {
              console.error("테마 변경 후 프로필 갱신 실패:", err);
            }
          }}
          onThemeOpen={() => setIsThemeOpen(true)}
          selectedThemeKeywords={selectedThemeKeywords}
          onComplete={() => setIsThemeStartOpen(false)}
        />
      )}

      {isThemeOpen && (
        <Theme
          isOpen={isThemeOpen}
          onClose={() => setIsThemeOpen(false)}
          initialKeywords={selectedThemeKeywords}
          onComplete={(keywords: any) => {
            setSelectedThemeKeywords(keywords);
            setIsThemeOpen(false);
          }}
        />
      )}
    </div>
  );
}
