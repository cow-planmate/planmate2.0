import useUserStore from "../../../store/Users";
import { v4 as uuidv4 } from 'uuid';

export default function UsersModal({setIsUsersOpen}) {
  const { users } = useUserStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm font-pretendard">
      <div className="relative bg-white p-4 rounded-2xl shadow-2xl sm:w-[580px] w-[90vw] border border-gray-100 max-h-[90vh] overflow-y-auto space-y-2">
        <div className="flex justify-between items-center px-2 pt-2">
          <div className="font-bold text-xl text-gray-800">
            동시편집자 목록
          </div>
          <button 
            className="text-2xl hover:bg-gray-100 w-8 h-8 rounded-full"
            onClick={() => setIsUsersOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="px-2 divide-y">
          {users?.map((user) => {
            return (
              <div 
                key={uuidv4()}
                className="flex items-center space-x-5 py-3"
              >
                <div
                  className="rounded-full size-10 bg-contain bg-no-repeat"
                  style={
                    user.userInfo.email ? {
                      backgroundImage: `url('${user.userInfo.email}')`
                    } : {
                      backgroundImage: "url('./src/assets/imgs/default.png')"
                    }
                  }
                  title={user.userInfo.nickname}
                >
                </div>
                <p>{user.userInfo.nickname}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}