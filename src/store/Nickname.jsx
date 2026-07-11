import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import gravatarUrl from '../utils/gravatarUrl';

const createCustomPlaceContent = (name) => ({
  placeId: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  name: name.trim(),
  categoryId: 3,
  formatted_address: "",
  rating: null,
  url: "",
  iconUrl:
    "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png",
});

const useNicknameStore = create(
  persist(
    (set) => ({
      nickname: '',
      gravatar: '',
      lastSelectedDay: {},
      customPlaces: {},

      setNickname: (value) => 
        set((state) => ({
          ...state,
          nickname: value 
        })),
        
      setGravatar: (value) => 
        set((state) => ({
          ...state,
          gravatar: gravatarUrl(value)
        })),

      setLastSelectedDay: (id, day) => 
        set((state) => ({
          ...state,
          lastSelectedDay: {
            ...state.lastSelectedDay,
            [id]: day,
          }
        })),

      createCustomPlace: (id, name) => {
        const newPlace = createCustomPlaceContent(name);
        set((state) => ({
          ...state,
          customPlaces: {
            ...state.customPlaces,
            [id]: [
              ...(state.customPlaces[id] ?? []),
              newPlace
            ]
          }
        }))
      },

      removeCustomPlace: (id, placeId) => {
        set((state) => ({
          customPlaces: {
            ...state.customPlaces,
            [id]: state.customPlaces[id]?.filter(
              (p) => p.placeId !== placeId
            ) ?? []
          }
        }));
      }
    }),
        
    {
      name: 'nickname',
    }
  )
)

export default useNicknameStore;