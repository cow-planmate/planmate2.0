import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import img1 from "../../assets/imgs/img1.jpg";
import img2 from "../../assets/imgs/img2.jpg";
import img3 from "../../assets/imgs/img3.jpg";

function HeroSlider() {
  const sliderHeightClass = "h-[14rem] sm:h-[20rem] lg:h-[36rem]";

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true,
    arrows: false,
    pauseOnHover: false,
    pauseOnFocus: false,
  };

  const slides = [
    { src: img1, alt: "여행 일정 협업 플래너 planMate 메인 비주얼" },
    { src: img2, alt: "동시에 함께 만드는 여행 스케줄" },
    { src: img3, alt: "여행지와 기간으로 일정 생성" },
  ];

  return (
    <div className="relative flex flex-col items-center overflow-hidden w-full">
      <h1 className="sr-only">동시협업 여행 플래너 planMate</h1>

      <Slider {...settings} className={`w-full ${sliderHeightClass}`}>
        {slides.map((slide, idx) => (
          <div key={idx}>
            <img
              src={slide.src}
              className={`w-full ${sliderHeightClass} object-cover`}
              alt={slide.alt}
            />
          </div>
        ))}
      </Slider>

      {/* overlay */}
      <div
        className={`absolute top-0 left-0 right-0 ${sliderHeightClass} bg-gradient-to-b from-transparent to-black/60 pointer-events-none`}
      />

      <div className="absolute bottom-6 sm:bottom-12 lg:bottom-20 left-0 right-0 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto">
          <div className="font-pretendard text-white font-bold text-left text-3xl sm:text-4xl lg:text-5xl leading-tight drop-shadow-md">
            <div className="mb-2 sm:mb-4">나다운, 우리다운</div>
            <div>여행의 시작</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSlider;
