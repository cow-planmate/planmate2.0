import { create } from 'zustand';
import gravatarUrl from '../utils/gravatarUrl';

const useUserStore = create((set) => ({
  users: [],

  setUserAll: (payload) =>
    set(() => ({
      users: payload.map((user) => ({
        ...user,
        userInfo: {
          ...user.userInfo,
          email: user.userInfo.email ? gravatarUrl(user.userInfo.email) : './src/assets/imgs/default.png',
        }
      }))
    }))
}));

export default useUserStore;