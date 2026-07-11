import { useEffect, useState } from "react"
import { useApiClient } from "../../hooks/useApiClient";

import Sunny from "../../assets/imgs/weather/clear-day.svg";             // 맑음
import SemiSunny from "../../assets/imgs/weather/cloudy-day-1.svg";      // 대체로 맑음
import SemiCloudy from "../../assets/imgs/weather/cloudy-day-2.svg";     // 구름 조금
import Cloudy from "../../assets/imgs/weather/cloudy-original.svg";      // 흐림
import Fog from "../../assets/imgs/weather/fog.svg";                     // 안개
import SemiRainy from "../../assets/imgs/weather/rainy-5.svg";           // 이슬비
import Rainy from "../../assets/imgs/weather/rainy-6.svg";               // 비
import Snowy from "../../assets/imgs/weather/snowy-6.svg";               // 눈
import Sonagi from "../../assets/imgs/weather/sonagi.svg";               // 소나기
import Thunderstorms from "../../assets/imgs/weather/thunderstorms.svg"; // 뇌우

export default function Weather({ timetables, selectedDay, travelCategoryName, travelName, travelId }) {
  const BASE_URL = import.meta.env.VITE_API_URL;

  const { post } = useApiClient();

  const [weather, setWeather] = useState({});
  const [nowWeather, setNowWeather] = useState({});
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const weatherIcons = {
    "맑음": Sunny,
    "대체로 맑음": SemiSunny,
    "구름 조금": SemiCloudy,
    "흐림": Cloudy,
    "안개": Fog,
    "이슬비": SemiRainy,
    "비": Rainy,
    "눈": Snowy,
    "소나기": Sonagi,
    "뇌우": Thunderstorms,
  }

  useEffect(() => {
    const loadWeather = async () => {
      const startDate = timetables?.[0]?.date;
      const endDate = timetables?.[timetables.length - 1]?.date;

      if (timetables && travelCategoryName && travelName && travelId) {
        try {
          const weatherData = await post(`${BASE_URL}/api/weather/recommendations`, {
            city: `${travelCategoryName} ${travelName}`,
            start_date: startDate,
            end_date: endDate,
          });
          setWeather(weatherData);
        } catch (err) {
          console.error("날씨를 불러오지 못했습니다.", err);
        }
      }
    }
    loadWeather();
  }, [timetables, travelCategoryName, travelName, travelId])

  useEffect(() => {
    const dayWeather = weather.weather?.[selectedDay];
    if (dayWeather) setNowWeather(dayWeather);
  }, [selectedDay, weather]);

  useEffect(() => {
    console.log(nowWeather)
    if (nowWeather) console.log(true);
    else console.log(false);
  }, [nowWeather])

  return (
    <div className="
      mx-5 md:m-0
      rounded-2xl md:rounded-none 
      border md:border-0
      md:border-b 
      px-4 py-2 md:py-4 
      absolute left-0 right-0 md:relative z-30
      flex items-center justify-between
      bg-white md:bg-transparent bg-clip-padding backdrop-filter backdrop-blur-md md:backdrop-blur-none bg-opacity-10
    ">
      {weather?.recommendation === "날씨 정보를 가져올 수 없어 시즌 평균 기온으로 대체합니다." &&
        <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 group/tooltip z-50">
          <div
            className="size-3 md:size-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[.5rem] md:text-xs font-semibold shadow-sm cursor-pointer hover:bg-red-600 transition-colors"
            onClick={() => {
              if (window.innerWidth < 768) {
                setIsTooltipOpen(!isTooltipOpen);
              }
            }}
          >
            !
          </div>
          <div className={`
            ${isTooltipOpen ? 'block' : 'hidden'} 
            md:group-hover/tooltip:block 
            absolute top-full right-0 mt-2 w-max max-w-[260px] bg-gray-800 text-white text-xs rounded-md px-3 py-2 z-50 whitespace-normal break-keep shadow-lg 
            after:content-[''] after:absolute after:bottom-full after:right-2 after:border-4 after:border-transparent after:border-b-gray-800 text-center
          `}>
            날씨 정보를 가져올 수 없어<br />시즌 평균 기온으로 대체합니다.
          </div>
        </div>
      }
      <div className="flex items-center">
        {weatherIcons[nowWeather?.description] &&
          <div
            className={nowWeather.description ? 'right-0 w-12 h-10 md:w-14 md:h-12 bg-no-repeat bg-center' : 'w-12 h-10 md:w-14 md:h-12 bg-gray-300 mr-2 rounded-lg'}
            style={{ backgroundImage: `url(${weatherIcons[nowWeather?.description]})` }}
          />
        }
        <div className="-space-y-1">
          <p className="text-xs text-gray-500">{selectedDay + 1}일차</p>
          {nowWeather.description ?
            <p className="text-base md:text-lg font-semibold">{nowWeather?.description}</p> :
            <div className="bg-gray-300 rounded-lg w-9 h-6"></div>
          }
        </div>
      </div>
      <div className="flex space-x-4 items-center">
        <div className="-space-y-1">
          <p className="text-xs text-gray-500">최저</p>
          {nowWeather.temp_min != null ?
            <p className="text-base md:text-lg font-semibold text-blue-600">{nowWeather?.temp_min}℃</p> :
            <div className="bg-gray-300 rounded-lg w-9 h-6"></div>
          }
        </div>
        <div className="-space-y-1">
          <p className="text-xs text-gray-500">최고</p>
          {nowWeather.temp_max != null ?
            <p className="text-base md:text-lg font-semibold text-red-600">{nowWeather?.temp_max}℃</p> :
            <div className="bg-gray-300 rounded-lg w-9 h-6"></div>
          }
        </div>
        <div className="-space-y-1">
          <p className="text-xs text-gray-500">체감</p>
          {nowWeather.feels_like != null ?
            <p className="text-base md:text-lg font-semibold">{nowWeather?.feels_like}℃</p> :
            <div className="bg-gray-300 rounded-lg w-9 h-6"></div>
          }
        </div>
      </div>
    </div>
  )
}