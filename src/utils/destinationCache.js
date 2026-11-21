const CACHE_VERSION = 1;

const FEATURED_CACHE_KEY = "planmate.destination.featured.v1";
const TREE_CACHE_KEY = "planmate.destination.tree.v1";

export const destinationQueryKeys = {
  featured: ["destination"],
  tree: ["destination", "tree"],
};

const isRegion = (region) =>
  region &&
  Number.isInteger(region.id) &&
  typeof region.name === "string" &&
  region.name.length > 0;

const isFeaturedList = (data) =>
  Array.isArray(data) && data.every(isRegion);

const isDestinationTree = (data) =>
  Array.isArray(data) &&
  data.every(
    (sido) =>
      isRegion(sido) &&
      typeof sido.featured === "boolean" &&
      Array.isArray(sido.children) &&
      sido.children.every(
        (child) => isRegion(child) && typeof child.featured === "boolean",
      ),
  );

const readCache = (storageKey, isValidData) => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (
      parsed?.version !== CACHE_VERSION ||
      !isValidData(parsed.data) ||
      (parsed.etag !== null && typeof parsed.etag !== "string")
    ) {
      localStorage.removeItem(storageKey);
      return null;
    }

    return {
      data: parsed.data,
      etag: parsed.etag,
    };
  } catch (error) {
    console.warn("여행지 로컬 캐시를 읽지 못해 초기화합니다.", error);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // localStorage 자체가 차단된 환경에서는 네트워크 조회만 사용합니다.
    }
    return null;
  }
};

const writeCache = (storageKey, data, etag) => {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: CACHE_VERSION,
        etag,
        data,
      }),
    );
  } catch (error) {
    console.warn("여행지 로컬 캐시를 저장하지 못했습니다.", error);
  }
};

const requestDestinationData = async ({
  path,
  storageKey,
  isValidData,
  mapResponse,
  errorMessage,
}) => {
  const cached = readCache(storageKey, isValidData);
  const headers = cached?.etag
    ? { "If-None-Match": cached.etag }
    : undefined;

  try {
    let response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      headers,
      cache: "no-store",
    });

    if (response.status === 304) {
      if (cached) return cached.data;

      // ETag만 남고 데이터가 사라진 비정상 상태에서는 본문을 다시 받습니다.
      response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
        cache: "no-store",
      });
    }

    if (!response.ok) {
      throw new Error(`${errorMessage} (HTTP ${response.status})`);
    }

    const data = mapResponse(await response.json());
    if (!isValidData(data)) {
      throw new Error(`${errorMessage} (잘못된 응답 형식)`);
    }

    writeCache(storageKey, data, response.headers.get("ETag"));
    return data;
  } catch (error) {
    if (cached) {
      console.warn(`${errorMessage} 저장된 목록을 대신 사용합니다.`, error);
      return cached.data;
    }
    throw error;
  }
};

const mapFeaturedResponse = (response) => {
  const destinations = response?.destinations ?? response;
  if (!Array.isArray(destinations)) return null;

  return destinations.map((destination) => ({
    id: destination.destinationId,
    name: destination.destinationName,
  }));
};

const mapTreeResponse = (response) => {
  if (!Array.isArray(response?.sidos)) return null;

  return response.sidos.map((sido) => ({
    id: sido.destinationId,
    name: sido.destinationName,
    featured: sido.featured,
    children: Array.isArray(sido.children)
      ? sido.children.map((child) => ({
          id: child.destinationId,
          name: child.destinationName,
          featured: child.featured,
        }))
      : [],
  }));
};

export const getCachedDestinationList = () =>
  readCache(FEATURED_CACHE_KEY, isFeaturedList)?.data;

export const getCachedDestinationTree = () =>
  readCache(TREE_CACHE_KEY, isDestinationTree)?.data;

export const fetchDestinationList = () =>
  requestDestinationData({
    path: "/api/destination",
    storageKey: FEATURED_CACHE_KEY,
    isValidData: isFeaturedList,
    mapResponse: mapFeaturedResponse,
    errorMessage: "여행지 목록을 불러오는 데 실패했습니다.",
  });

export const fetchDestinationTree = () =>
  requestDestinationData({
    path: "/api/destination/tree",
    storageKey: TREE_CACHE_KEY,
    isValidData: isDestinationTree,
    mapResponse: mapTreeResponse,
    errorMessage: "상세 여행지 목록을 불러오는 데 실패했습니다.",
  });
