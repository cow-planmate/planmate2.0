import { create } from 'zustand';

const mergeUniquePlaces = (currentPlaces, newPlaces) => {
  const seenPlaceIds = new Set();

  return [...(currentPlaces ?? []), ...(newPlaces ?? [])].filter((place) => {
    // placeId가 없는 비정상 데이터는 여기서 임의로 하나로 합치지 않는다.
    if (place?.placeId == null) return true;
    if (seenPlaceIds.has(place.placeId)) return false;

    seenPlaceIds.add(place.placeId);
    return true;
  });
};

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
      [field]: mergeUniquePlaces(state[field], value),
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
