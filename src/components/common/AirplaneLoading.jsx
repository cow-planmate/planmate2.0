
const AirplaneLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full md:h-[calc(100vh-69px)] w-full relative overflow-hidden bg-sky-50">
      <style>
        {`
          @keyframes fly {
            0% { transform: translate(0px, 0px) rotate(0deg); }
            25% { transform: translate(15px, -15px) rotate(5deg); }
            50% { transform: translate(0px, -5px) rotate(0deg); }
            75% { transform: translate(-15px, 10px) rotate(-5deg); }
            100% { transform: translate(0px, 0px) rotate(0deg); }
          }
          @keyframes cloudMove {
            0% { transform: translateX(100vw); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translateX(-100vw); opacity: 0; }
          }
          .animate-fly {
            animation: fly 4s ease-in-out infinite;
          }
          .cloud {
            position: absolute;
            background: white;
            border-radius: 50px;
            animation: cloudMove linear infinite;
          }
          .cloud::before, .cloud::after {
            content: '';
            position: absolute;
            background: white;
            border-radius: 50%;
          }
          .cloud-1 {
            width: 120px; height: 40px; top: 20%; left: -20%; animation-duration: 8s; animation-delay: 0s;
          }
          .cloud-1::before { width: 50px; height: 50px; top: -20px; left: 15px; }
          .cloud-1::after { width: 70px; height: 70px; top: -35px; right: 15px; }
          
          .cloud-2 {
            width: 80px; height: 25px; top: 60%; left: -20%; animation-duration: 12s; animation-delay: 4s; opacity: 0.6;
          }
          .cloud-2::before { width: 35px; height: 35px; top: -15px; left: 10px; }
          .cloud-2::after { width: 45px; height: 45px; top: -20px; right: 10px; }

          .cloud-3 {
            width: 150px; height: 45px; top: 80%; left: -20%; animation-duration: 10s; animation-delay: 2s;
          }
          .cloud-3::before { width: 60px; height: 60px; top: -30px; left: 20px; }
          .cloud-3::after { width: 80px; height: 80px; top: -45px; right: 20px; }

          /* Foreground Clouds */
          .cloud-4 {
            width: 200px; height: 60px; top: 35%; left: -30%; animation-duration: 6s; animation-delay: 1s; opacity: 0.95; filter: blur(2px);
          }
          .cloud-4::before { width: 80px; height: 80px; top: -40px; left: 30px; }
          .cloud-4::after { width: 100px; height: 100px; top: -50px; right: 30px; }

          .cloud-5 {
            width: 250px; height: 75px; top: 65%; left: -40%; animation-duration: 5s; animation-delay: 3s; filter: blur(4px); opacity: 0.9;
          }
          .cloud-5::before { width: 100px; height: 100px; top: -50px; left: 40px; }
          .cloud-5::after { width: 120px; height: 120px; top: -60px; right: 40px; }
        `}
      </style>

      {/* Background Clouds */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>

      {/* Airplane and Text */}
      <div className="flex flex-col items-center">
        <div className="z-10 relative animate-fly -rotate-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            className="w-32 h-32 text-blue-500 drop-shadow-xl"
            fill="currentColor"
            style={{ filter: "drop-shadow(0px 10px 10px rgba(0,0,0,0.15))" }}
          >
            <path d="M482.3 192c34.2 0 93.7 29 93.7 64c0 36-59.5 64-93.7 64l-116.6 0L265.2 495.9c-5.7 10-16.3 16.1-27.8 16.1l-56.2 0c-10.6 0-18.3-10.2-15.4-20.4l49-171.6L112 320 68.8 377.6c-3 4-8 6.4-13.4 6.4l-42 0c-7.8 0-13.6-7.3-11.7-14.8L35.6 256 1.7 142.8C-.2 135.3 5.6 128 13.4 128l42 0c5.4 0 10.4 2.4 13.4 6.4L112 192l102.9 0-49-171.6C162.9 10.2 170.6 0 181.2 0l56.2 0c11.5 0 22.1 6.2 27.8 16.1L365.7 192l116.6 0z" />
          </svg>
        </div>
        <div className="z-30 relative mt-8 text-2xl font-bold text-gray-700 tracking-wide">
          일정 정보를 불러오는 중...
        </div>
        <div className="z-30 relative mt-2 text-sm text-gray-500 font-medium">
          PlanMate가 당신의 완벽한 여행을 그리고 있어요
        </div>
      </div>

      {/* Foreground Clouds (Passes over the airplane) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="cloud cloud-4"></div>
        <div className="cloud cloud-5"></div>
      </div>
    </div>
  );
};

export default AirplaneLoading;
