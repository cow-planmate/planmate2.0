import { create } from 'zustand';

const usePlacesStore = create((set) => ({
  isLoading: false,

  tour: [],
  lodging: [],
  restaurant: [],
  search: [],
  weather: [],

  tourNext: [],
  lodgingNext: [],
  restaurantNext: [],
  searchNext: [],

  setPlacesLoading: (isLoading) =>
    set((state) => ({
      ...state,
      isLoading,
    })),

  setPlacesAll: (payload) =>
    set((state) => ({
      ...state,
      tour: payload.tour,
      tourNext: payload.tourNext,
      lodging: payload.lodging,
      lodgingNext: payload.lodgingNext,
      restaurant: payload.restaurant,
      restaurantNext: payload.restaurantNext
    })),

  setAddSearch: (payload) =>
    set((state) => ({
      ...state,
      search: payload.search,
      searchNext: payload.searchNext,
    })),

  setAddNext: (field, value, nextPageTokens) =>
    set((state) => ({
      ...state,
      [field]: [
        ...(state[field] ?? []),
        ...value
      ],
      [`${field}Next`]: nextPageTokens,
    })),

  resetPlaces: () =>
    set({
      tour: [],
      lodging: [],
      restaurant: [],
      search: [],
      weather: [],
      tourNext: [],
      lodgingNext: [],
      restaurantNext: [],
      searchNext: [],
    }),
}));

export default usePlacesStore;