import { SectionsContainer, Section } from "react-fullpage";
import Navbar from "../components/common/Navbar";
import { useNavigate } from "react-router-dom";
import schedule from "../assets/imgs/schedule.png";
import bg1 from "../assets/imgs/bg1.jpg";
import bg2 from "../assets/imgs/bg2.jpg";
import land1 from "../assets/imgs/land1.png";
import land2 from "../assets/imgs/land2.png";
import land3 from "../assets/imgs/land3.png";
import { gsap } from "gsap";
import { useState } from "react";
import Signup from "../components/auth/Signup";
import Theme from "../components/auth/Theme";
import Themestart from "../components/auth/Themestart";
import { useApiClient } from "../hooks/useApiClient";

function App() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isThemestartOpen, setIsThemestartOpen] = useState(false);
  const [selectedThemeKeywords, setSelectedThemeKeywords] = useState({
    tourist: [],
    accommodation: [],
    restaurant: [],
  });

  // Navbar의 핸들러 함수들 복사
  const handleSignupOpen = () => {
    setIsSignupOpen(true);
  };

  const handleSignupClose = () => {
    setIsSignupOpen(false);
  };

  const handleThemeOpen = () => {
    setIsThemeOpen(true);
  };

  const handleThemeClose = () => {
    setIsThemeOpen(false);
  };

  const handleThemestartOpen = () => {
    setIsThemestartOpen(true);
  };

  const handleThemestartClose = () => {
    setIsThemestartOpen(false);
  };

  const handleThemeComplete = (keywords) => {
    setSelectedThemeKeywords(keywords);
    setIsThemeOpen(false);
  };
  const options = {
    activeClass: "active",
    anchors: ["One", "Two", "Three", "Four", "Five", "Six"],
    arrowNavigation: true,
    rollingSpeed: 1000,
    navigation: true,
    scrollBar: false, // use the browser default scrollbar
  };
  const navigate = useNavigate();
  return (
    <>
      <button
        className="fixed bottom-7 right-7 px-4 py-2 bg-main ease-in-out delay-75 hover:bg-blue-900 text-white text-xl font-medium rounded-md hover:-translate-y-1 hover:scale-100 active:scale-95 transition-all duration-200 font-pretendard z-50"
        onClick={() => {
          navigate("/");
        }}
      >
        시작하기
      </button>
      <SectionsContainer {...options}>
        <Section>
          <div className="w-full bg-white min-h-screen bg-cover bg-center relative group">
            <div className="absolute inset-0 bg-white opacity-30 z-10"></div>
            <div className="flex items-center justify-center h-screen z-20 relative">
              <button className="cursor-pointer relative group/button overflow-hidden border-4 px-16 py-8 border-main z-30">
                <div className="absolute inset-0 bg-white opacity-80 -z-10"></div>
                <span className="text-white font-bold text-7xl relative z-10 group-hover:text-main duration-700 delay-400 font-mediumpaperlogy">
                  P L A N M A T E
                </span>
                <span className="absolute top-0 left-0 w-full bg-main duration-500 group-hover:-translate-x-full h-full"></span>
                <span className="absolute top-0 left-0 w-full bg-main duration-500 group-hover:translate-x-full h-full"></span>
                <span className="absolute top-0 left-0 w-full bg-main duration-500 delay-300 group-hover:-translate-y-full h-full"></span>
                <span className="absolute delay-300 top-0 left-0 w-full bg-main duration-500 group-hover:translate-y-full h-full"></span>
              </button>
            </div>
          </div>
        </Section>
        <Section>
          <div className="bg-white w-full min-h-screen flex">
            {/* Left Section */}
            <div className="w-1/2 flex flex-col justify-center pl-[10rem] pr-[4rem]">
              <h1 className="text-6xl font-bold text-black mb-8 leading-tight font-mediumpaperlogy">
                <span>우리들의 여행 동반자</span>
              </h1>

              <p className="text-lg text-gray-600 mb-12 leading-relaxed">
                <span className="font-mediumpaperlogy">
                  드래그앤드롭 방식 일정생성과 실시간 협업 기능으로
                </span>
                <br />
                <span className="font-mediumpaperlogy">
                  여행계획을 간편하고 효율적이게
                </span>
              </p>

              <div className="flex space-x-4">
                <button
                  className="bg-main text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-mediumpaperlogy"
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  일정 생성하러 가기→
                </button>
                <button
                  className="border border-gray-300 text-black px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-mediumpaperlogy"
                  onClick={handleSignupOpen}
                >
                  회원가입하기
                </button>
              </div>
            </div>

            <div className="w-1/2 flex items-center justify-center">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8 w-full max-w-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 614 390"
                  height="390"
                  width="614"
                  className="max-w-full h-auto"
                >
                  <g id="schedule" className="cursor-pointer">
                    <image
                      x="50"
                      y="40"
                      width="300"
                      height="280"
                      href={schedule}
                      preserveAspectRatio="xMidYMid slice"
                      className="border-gray-400 rounded-lg shadow-lg"
                    />

                    <rect
                      x="50"
                      y="40"
                      width="300"
                      height="280"
                      fill="rgba(255, 255, 255, 0.1)"
                      rx="8"
                    />
                  </g>

                  <g
                    id="box"
                    className="cursor-pointer opacity-0 animate-[box_5s_ease_infinite_alternate]"
                  >
                    <rect
                      x="28"
                      y="20"
                      width="559"
                      height="286"
                      fill="#2563EB"
                      fillOpacity="0.05"
                      stroke="#2563EB"
                      strokeWidth="2"
                    />

                    <rect
                      x="23"
                      y="15"
                      width="10"
                      height="10"
                      fill="white"
                      stroke="#2563EB"
                      strokeWidth="2"
                    />
                    <rect
                      x="23"
                      y="301"
                      width="10"
                      height="10"
                      fill="white"
                      stroke="#2563EB"
                      strokeWidth="2"
                    />
                    <rect
                      x="582"
                      y="301"
                      width="10"
                      height="10"
                      fill="white"
                      stroke="#2563EB"
                      strokeWidth="2"
                    />
                    <rect
                      x="582"
                      y="15"
                      width="10"
                      height="10"
                      fill="white"
                      stroke="#2563EB"
                      strokeWidth="2"
                    />
                  </g>

                  <g
                    id="cursor1"
                    className="cursor-pointer animate-[cursor1_6s_ease_infinite_alternate] origin-center"
                    style={{ transformBox: "fill-box" }}
                  >
                    <polygon
                      points="448,317 453.383,343 459.745,333.5 471,331"
                      fill="#2563EB"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </g>

                  <g
                    id="cursor2"
                    className="cursor-pointer animate-[cursor2_7s_ease_infinite_alternate] origin-center"
                    style={{ transformBox: "fill-box" }}
                  >
                    <polygon
                      points="200,200 205.383,226 211.745,216.5 223,214"
                      fill="#10b981"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </g>
                </svg>
                <style jsx>{`
                  @keyframes slideReveal {
                    0% {
                      transform: scale(0.8);
                      opacity: 0;
                    }
                    100% {
                      transform: scale(1);
                      opacity: 1;
                    }
                  }

                  @keyframes textReveal {
                    0% {
                      opacity: 0;
                      color: white;
                    }
                    100% {
                      opacity: 1;
                      color: #2563eb;
                    }
                  }

                  @keyframes slide1 {
                    0% {
                      transform: translateX(0);
                    }
                    100% {
                      transform: translateX(-100%);
                    }
                  }

                  @keyframes slide2 {
                    0% {
                      transform: translateX(0);
                    }
                    100% {
                      transform: translateX(100%);
                    }
                  }

                  @keyframes slide3 {
                    0% {
                      transform: translateY(0);
                    }
                    100% {
                      transform: translateY(-100%);
                    }
                  }

                  @keyframes slide4 {
                    0% {
                      transform: translateY(0);
                    }
                    100% {
                      transform: translateY(100%);
                    }
                  }
                  @keyframes slideReveal {
                    0% {
                      transform: scale(0.8);
                      opacity: 0;
                    }
                    100% {
                      transform: scale(1);
                      opacity: 1;
                    }
                  }

                  @keyframes textReveal {
                    0% {
                      opacity: 0;
                      color: white;
                    }
                    100% {
                      opacity: 1;
                      color: #2563eb;
                    }
                  }

                  @keyframes slide1 {
                    0% {
                      transform: translateX(0);
                    }
                    100% {
                      transform: translateX(-100%);
                    }
                  }

                  @keyframes slide2 {
                    0% {
                      transform: translateX(0);
                    }
                    100% {
                      transform: translateX(100%);
                    }
                  }

                  @keyframes slide3 {
                    0% {
                      transform: translateY(0);
                    }
                    100% {
                      transform: translateY(-100%);
                    }
                  }

                  @keyframes slide4 {
                    0% {
                      transform: translateY(0);
                    }
                    100% {
                      transform: translateY(100%);
                    }
                  }

                  @keyframes cursor1 {
                    0% {
                      opacity: 0;
                      transform: translate3d(300px, 0, 0) scale(1);
                    }
                    25% {
                      opacity: 1;
                      transform: translate3d(0, 0, 0) scale(1);
                    }
                    50% {
                      opacity: 1;
                      transform: translate3d(-200px, -200px, 0) scale(1);
                    }
                    55% {
                      opacity: 1;
                      transform: translate3d(-200px, -200px, 0) scale(0.95);
                    }
                    60% {
                      opacity: 1;
                      transform: translate3d(-200px, -200px, 0) scale(1);
                    }
                    100% {
                      opacity: 1;
                      transform: translate3d(-300px, -50px, 0) scale(1);
                    }
                  }

                  @keyframes cursor2 {
                    0% {
                      opacity: 0;
                      transform: translate3d(-100px, 100px, 0) scale(1)
                        rotate(0deg);
                    }
                    20% {
                      opacity: 1;
                      transform: translate3d(50px, -50px, 0) scale(1)
                        rotate(10deg);
                    }
                    40% {
                      opacity: 1;
                      transform: translate3d(150px, -100px, 0) scale(1)
                        rotate(-5deg);
                    }
                    45% {
                      opacity: 1;
                      transform: translate3d(150px, -100px, 0) scale(0.9)
                        rotate(-5deg);
                    }
                    50% {
                      opacity: 1;
                      transform: translate3d(150px, -100px, 0) scale(1)
                        rotate(-5deg);
                    }
                    70% {
                      opacity: 1;
                      transform: translate3d(250px, 20px, 0) scale(1)
                        rotate(15deg);
                    }
                    100% {
                      opacity: 1;
                      transform: translate3d(100px, 80px, 0) scale(1)
                        rotate(-10deg);
                    }
                  }

                  @keyframes box {
                    0%,
                    50% {
                      opacity: 0;
                    }
                    55%,
                    100% {
                      opacity: 1;
                    }
                  }
                `}</style>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <div className="bg-white w-full min-h-screen flex">
            <div className="w-1/2 flex flex-col justify-center pl-[10rem] pr-[4rem]">
              <h1 className="text-6xl font-bold text-black mb-8 leading-tight font-mediumpaperlogy">
                <span>손쉽게 드래그앤 드롭으로</span>
                <br />
                <span>일정생성하기!</span>
              </h1>

              <p className="text-lg text-gray-600 mb-12 leading-relaxed">
                <span className="font-mediumpaperlogy">
                  직관적인 인터페이스로 여행 장소를 선택하고
                </span>
                <br />
                <span className="font-mediumpaperlogy">
                  드래그만으로 일정을 완성하세요
                </span>
              </p>

              <div className="flex space-x-4">
                <button
                  className="bg-main text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-mediumpaperlogy"
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  일정 만들기 시작→
                </button>
              </div>
            </div>

            <div className="w-1/2 flex items-center justify-center">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8 w-full max-w-2xl relative">
                <div className="relative">
                  <img
                    src={land3}
                    alt="드래그앤드롭 인터페이스"
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 614 390"
                  height="390"
                  width="614"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ width: "100%", height: "100%" }}
                >
                  <rect
                    x="150"
                    y="150"
                    width="80"
                    height="60"
                    fill="white"
                    fillOpacity="0.8"
                    rx="4"
                    className="animate-[dragBlock_4s_ease_infinite]"
                  />

                  <g
                    id="cursor-drag"
                    className="cursor-pointer animate-[cursorDrag_4s_ease_infinite] origin-center"
                    style={{ transformBox: "fill-box" }}
                  >
                    <polygon
                      points="200,180 205.383,206 211.745,196.5 223,194"
                      fill="#2563EB"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </g>
                </svg>

                <style jsx>{`
                  @keyframes dragBlock {
                    0% {
                      transform: translate(0, 0);
                      opacity: 0;
                    }
                    10% {
                      opacity: 1;
                    }
                    50% {
                      transform: translate(200px, 50px);
                      opacity: 1;
                    }
                    90% {
                      opacity: 1;
                    }
                    100% {
                      transform: translate(0, 0);
                      opacity: 0;
                    }
                  }

                  @keyframes cursorDrag {
                    0% {
                      opacity: 0;
                      transform: translate3d(-50px, -30px, 0) scale(1);
                    }
                    10% {
                      opacity: 1;
                      transform: translate3d(0, 0, 0) scale(1);
                    }
                    15% {
                      opacity: 1;
                      transform: translate3d(0, 0, 0) scale(0.9);
                    }
                    20% {
                      opacity: 1;
                      transform: translate3d(0, 0, 0) scale(1);
                    }
                    50% {
                      opacity: 1;
                      transform: translate3d(200px, 50px, 0) scale(1);
                    }
                    55% {
                      opacity: 1;
                      transform: translate3d(200px, 50px, 0) scale(0.9);
                    }
                    60% {
                      opacity: 1;
                      transform: translate3d(200px, 50px, 0) scale(1);
                    }
                    90% {
                      opacity: 1;
                      transform: translate3d(0, 0, 0) scale(1);
                    }
                    100% {
                      opacity: 0;
                      transform: translate3d(-50px, -30px, 0) scale(1);
                    }
                  }
                `}</style>
              </div>
            </div>
          </div>
        </Section>
        <Section>
          <div className="bg-white w-full min-h-screen flex">
            <div className="w-1/2 flex flex-col justify-center pl-[10rem] pr-[4rem]">
              <h1 className="text-6xl font-bold text-black mb-8 leading-tight font-mediumpaperlogy">
                <span>친구들을 초대에 함께</span>
                <br />
                <span>만들어가는 우리들의 일정!</span>
              </h1>

              <p className="text-lg text-gray-600 mb-12 leading-relaxed">
                <span className="font-mediumpaperlogy">
                  실시간으로 친구들과 협업하며
                </span>
                <br />
                <span className="font-mediumpaperlogy">
                  완벽한 여행 계획을 함께 만들어보세요
                </span>
              </p>

              <div className="flex space-x-4">
                <button
                  className="bg-main text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-mediumpaperlogy"
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  협업 기능 사용하기→
                </button>
              </div>
            </div>

            <div className="w-1/2 flex items-center justify-center">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8 w-full max-w-2xl">
                <div className="relative mb-6">
                  <img
                    src={land3}
                    alt="협업 인터페이스"
                    className="w-full h-auto rounded-lg shadow-md"
                  />

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 614 390"
                    height="390"
                    width="614"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <g
                      id="cursor1-page5"
                      className="cursor-pointer animate-[cursor1_6s_ease_infinite_alternate] origin-center"
                      style={{ transformBox: "fill-box" }}
                    >
                      <polygon
                        points="448,317 453.383,343 459.745,333.5 471,331"
                        fill="#2563EB"
                        stroke="white"
                        strokeWidth="2"
                      />
                    </g>

                    <g
                      id="cursor2-page5"
                      className="cursor-pointer animate-[cursor2_7s_ease_infinite_alternate] origin-center"
                      style={{ transformBox: "fill-box" }}
                    >
                      <polygon
                        points="200,200 205.383,226 211.745,216.5 223,214"
                        fill="#10b981"
                        stroke="white"
                        strokeWidth="2"
                      />
                    </g>
                  </svg>
                </div>

                <div className="relative">
                  <img
                    src={land1}
                    alt="일정 관리"
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </Section>
        <Section>
          <div className="bg-white w-full min-h-screen">
            <div className="flex items-center justify-center h-screen text-main text-7xl font-bold font-mediumpaperlogy">
              P L A N M A T E
            </div>
          </div>
        </Section>
      </SectionsContainer>
      <Signup
        isOpen={isSignupOpen}
        onClose={handleSignupClose}
        onThemeOpen={handleThemestartOpen}
        selectedThemeKeywords={selectedThemeKeywords}
      />
      <Theme
        isOpen={isThemeOpen}
        onClose={handleThemeClose}
        onComplete={handleThemeComplete}
      />
      <Themestart
        isOpen={isThemestartOpen}
        onClose={handleThemestartClose}
        onThemeOpen={handleThemeOpen}
        selectedThemeKeywords={selectedThemeKeywords}
      />
    </>
  );
}

export default App;
