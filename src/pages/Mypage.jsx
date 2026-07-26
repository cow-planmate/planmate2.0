import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import PlanList from "../components/Mypage/PlanList";
import Profile from "../components/Mypage/Profile";
import { useApiClient } from "../hooks/useApiClient";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { ErrorToast } from "../components/common/Toast";
import { Helmet } from "react-helmet";

// 컴포넌트 이름을 App에서 Mypage로 변경하여 명확성 확보
function Mypage() {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const { get, isAuthenticated, logout } = useApiClient();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [userProfile, setUserProfile] = useState(null);
  const [myPlans, setMyPlans] = useState([]);
  const [editablePlans, setEditablePlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      ErrorToast("로그인 시에만 접근 가능한 페이지입니다.");
      navigate("/");
      return;
    }
  }, [navigate, isAuthenticated]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);

      if (isAuthenticated()) {
        try {
          // v2 API 명세: GET /api/user/profile
          const profileData = await get(`${BASE_URL}/api/user/profile`);

          setUserProfile(profileData);
          // 📌 v2 Response 반영: 응답 필드명 변경 (myPlanVOs -> myPlans)
          setMyPlans(profileData.myPlans || []);
          // 📌 v2 Response 반영: 응답 필드명 변경 (editablePlanVOs -> sharedPlans)
          setEditablePlans(profileData.sharedPlans || []);
        } catch (err) {
          console.error("프로필 정보를 가져오는데 실패했습니다:", err);

          if (err.message.includes("인증이 만료")) {
            handleLogout();
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, get, refreshTrigger, BASE_URL]);

  const handlePlanListRefresh = () => {
    setRefreshTrigger((prev) => !prev);
  };

  return (
    <div className="font-pretendard min-h-screen">
      <Helmet>
        <title>planMate : 마이페이지</title>
        <meta
          name="description"
          content="내 여행 일정과 프로필을 관리하는 페이지입니다."
        />
      </Helmet>
      {loading && <LoadingOverlay />}

      <Navbar onInvitationAccept={handlePlanListRefresh} />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="font-bold text-2xl sm:text-3xl pb-4 sm:pb-6">
            마이페이지
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 w-full items-start">
            <div className="w-full lg:w-[30%] lg:min-w-[320px] lg:max-w-[450px] flex-shrink-0">
              <Profile
                userProfile={userProfile}
                setUserProfile={setUserProfile}
              />
            </div>

            <div className="w-full lg:flex-1">
              <PlanList
                myPlans={myPlans}
                setMyPlans={setMyPlans}
                editablePlans={editablePlans}
                setEditablePlans={setEditablePlans}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mypage;
