import { BrowserRouter, Route, Routes } from "react-router-dom";
import Complete2 from "../pages/Complete2";
import Create2 from "../pages/Create2";
import Home from "../pages/Home";
import Landingpage from "../pages/Landingpage";
import Logintest from "../pages/Logintest";
import OAuthAdditionalInfo from "../pages/OAuthAdditionalInfo";
import OAuthCallback from "../pages/OAuthCallback";
import Passwordfindtest from "../pages/Passwordfindtest";
import PlanmateV2 from "../pages/PlanmateV2";
import Signuptest from "../pages/Signuptest";
import Themetest from "../pages/Themetest";

import GlobalTempPlanModal from "../components/common/GlobalTempPlanModal";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Router = () => {
  return (
    <BrowserRouter>
      <GlobalTempPlanModal />
      <ToastContainer />
      <Routes>
        {/* PlanmateV2 shell routes (new architecture) */}
        <Route path="/" element={<PlanmateV2 />} />
        <Route path="feed" element={<PlanmateV2 />} />
        <Route path="feed/:region" element={<PlanmateV2 />} />
        <Route path="community" element={<PlanmateV2 />} />
        <Route path="community/create" element={<PlanmateV2 />} />
        <Route path="community/create/:type" element={<PlanmateV2 />} />
        <Route path="community/:category" element={<PlanmateV2 />} />
        <Route path="community/:category/:id" element={<PlanmateV2 />} />
        <Route path="travel/:id" element={<PlanmateV2 />} />
        <Route path="mypage" element={<PlanmateV2 />} />
        <Route path="mypage/:userId" element={<PlanmateV2 />} />
        <Route path="social" element={<PlanmateV2 />} />
        <Route path="plan-maker" element={<PlanmateV2 />} />
        <Route path="create-post" element={<PlanmateV2 />} />
        <Route path="legacy-home" element={<Home />} />

        {/* Auth routes */}
        <Route path="signuptest" element={<Signuptest />} />
        <Route path="logintest" element={<Logintest />} />
        <Route path="themetest" element={<Themetest />} />
        <Route path="passwordfindtest" element={<Passwordfindtest />} />
        <Route path="landingpage" element={<Landingpage />} />

        {/* Travel itinerary - main's improved version */}
        <Route path="create" element={<Create2 />} />
        <Route path="complete" element={<Complete2 />} />

        {/* OAuth routes */}
        <Route path="oauth/callback" element={<OAuthCallback />} />
        <Route path="oauth/additional-info" element={<OAuthAdditionalInfo />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
