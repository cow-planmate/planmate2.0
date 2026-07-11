import { getTimeTableId } from "../../utils/createUtils";
import MapComponent from "../common/MapComponent"

export default function MapArea({ placeBlocks, timetables, selectedDay, showSidebar }) {
  const schedule = placeBlocks[getTimeTableId(timetables, selectedDay)] || [];

  return (
    <div className={`
      flex-1 w-full h-full overflow-y-auto transition-transform duration-300 absolute inset-0 md:relative md:transform-none z-20 
      md:border md:border-gray-300 md:rounded-lg
      ${showSidebar ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
    `}>
      <MapComponent schedule={schedule} />
    </div>
  )
}