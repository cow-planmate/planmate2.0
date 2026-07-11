import MapComponent from "../../common/MapComponent";
import { getTimeTableId } from "../../../utils/createUtils";
import useTimetableStore from "../../../store/Timetables";
import useItemsStore from "../../../store/Schedules"

export default function MapModal({setIsMapOpen}) {
  const { timetables, selectedDay } = useTimetableStore();
  const { items } = useItemsStore()
  const schedule = items[getTimeTableId(timetables, selectedDay)] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm font-pretendard">
      <div className="relative bg-white rounded-2xl shadow-2xl w-[90vw] border border-gray-100 h-[90vh] overflow-y-auto space-y-2 m-0">
        <MapComponent schedule={schedule}/>
        <button
          onClick={() => setIsMapOpen(false)}
          className="absolute shadow-2xl top-6 right-6 z-50 text-2xl w-10 h-10 bg-main/60 hover:bg-mainDark/60 backdrop-blur-sm text-white rounded-full font-medium transition-all duration-200"
        >
          ×
        </button>
      </div>
    </div>
  )
} 