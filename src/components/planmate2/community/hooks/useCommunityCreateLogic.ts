import { ko } from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useMemo, useState } from 'react';
import { type PlaceSuggestion } from '../../../../api/placeApi';
import { deleteImage, uploadImage, type RecommendPlace } from '../api/communityApi';
import { blocksToText } from '../utils/blocksToText';
import { fileToDataUrl, resolveContentImages } from '../utils/pendingImages';
import { useCreatePost, usePost, useUpdatePost } from './queries';

/** 첫 번째 이미지 블록의 URL → 썸네일 */
const firstImageUrl = (blocks: any[]): string | null => {
  for (const block of blocks) {
    if (block.type === 'image' && block.props?.url) return block.props.url;
    if (Array.isArray(block.children)) {
      const nested = firstImageUrl(block.children);
      if (nested) return nested;
    }
  }
  return null;
};

export const useCommunityCreateLogic = (
  type: 'free' | 'qna' | 'recommend',
  onSubmit: () => void,
  /** 지정하면 수정 모드로 동작한다 (기존 글을 불러와 프리필 후 PATCH) */
  editPostId?: number | string
) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  // 검색으로 고른 장소. 직접 입력했거나 고른 뒤 글자를 고치면 null이 된다
  const [place, setPlace] = useState<PlaceSuggestion | null>(null);
  // 장소 추천 글에 담은 장소들 ("일산 카페들"처럼 여러 곳을 한 글에 묶는다). 첫 번째가 대표 장소다
  const [places, setPlaces] = useState<RecommendPlace[]>([]);
  const [rating, setRating] = useState('5.0');

  const isEditMode = editPostId != null;
  const { data: existingPost } = usePost(isEditMode ? editPostId : undefined);
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost(Number(editPostId));

  const initialContent = useMemo(() => [
    {
      type: "paragraph",
      content: [],
    },
  ], []);

  // 삽입 시엔 서버에 올리지 않고 data: URL로만 둔다 (실제 업로드는 등록 시 resolveContentImages에서).
  // 등록하지 않고 이탈한 draft의 이미지가 MinIO에 고아로 남는 것을 방지한다.
  const uploadFile = async (file: File) => {
    try {
      return await fileToDataUrl(file);
    } catch (error) {
      alert(`이미지를 불러오지 못했습니다: ${(error as Error).message}`);
      throw error;
    }
  };

  const editor = useCreateBlockNote({
    dictionary: ko,
    initialContent,
    // '/' 명령 이미지 업로드 → 커뮤니티 이미지 API (MinIO)
    uploadFile,
  });

  // 수정 모드: 조회된 게시글을 폼과 에디터에 한 번만 채워 넣는다
  const [isPrefilled, setIsPrefilled] = useState(false);
  useEffect(() => {
    if (!isEditMode || !existingPost || isPrefilled) return;

    setTitle(existingPost.title ?? '');
    // 수정 모드: 저장돼 있던 장소를 그대로 복원해야 장소를 다시 안 고르고 저장할 수 있다.
    // 서버는 장소가 하나뿐인 옛 글도 한 건짜리 배열로 내려준다
    if (existingPost.places?.length) {
      setPlaces(existingPost.places);
    }
    if (existingPost.region) setLocation(existingPost.region);
    if (existingPost.rating) setRating(String(existingPost.rating));

    const blocks = existingPost.content as any[];
    if (Array.isArray(blocks) && blocks.length > 0) {
      editor.replaceBlocks(editor.document, blocks);
    }
    setIsPrefilled(true);
  }, [isEditMode, existingPost, isPrefilled, editor]);

  /** 서버와 같은 상한 — 여기서 먼저 막아야 다 적고 나서 등록 버튼에서 튕기지 않는다 */
  const MAX_PLACES = 30;
  /** 담자마자 평점이 비어 있으면 글 평점(평균)이 안 잡힌다 — 만점에서 시작해 내리게 한다 */
  const DEFAULT_PLACE_RATING = 5;

  const toPlace = (picked: PlaceSuggestion | null, name: string): RecommendPlace => ({
    name,
    address: picked?.address ?? null,
    phone: picked?.phone ?? null,
    category: picked?.category ?? null,
    url: picked?.url ?? null,
    lat: picked?.lat ?? null,
    lng: picked?.lng ?? null,
    memo: null,
    rating: DEFAULT_PLACE_RATING,
  });

  /**
   * 검색창에 들어 있는 장소를 목록에 담는다.
   * 검색 결과를 고르지 않고 직접 입력한 이름도 그대로 받는다 (검색에 안 잡히는 장소가 있다).
   */
  const addPlace = (picked?: PlaceSuggestion | null) => {
    const source = picked ?? place;
    const name = (source?.name ?? location).trim();
    if (!name) return;
    if (places.length >= MAX_PLACES) {
      alert(`장소는 최대 ${MAX_PLACES}곳까지 담을 수 있습니다.`);
      return;
    }
    const isDuplicate = places.some((p) => p.name === name && p.lat === (source?.lat ?? null));
    if (!isDuplicate) {
      setPlaces([...places, toPlace(source ?? null, name)]);
    }
    // 담은 뒤엔 검색창을 비워 다음 장소를 바로 칠 수 있게 한다
    setLocation('');
    setPlace(null);
  };

  const removePlace = (index: number) => setPlaces(places.filter((_, i) => i !== index));

  /** 순서 바꾸기 — 목록의 첫 번째가 대표 장소(목록 배지·지도 초기 위치)가 된다 */
  const movePlace = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= places.length) return;
    const next = [...places];
    [next[index], next[target]] = [next[target], next[index]];
    setPlaces(next);
  };

  const setPlaceMemo = (index: number, memo: string) =>
    setPlaces(places.map((p, i) => (i === index ? { ...p, memo } : p)));

  const setPlaceRating = (index: number, rating: number) =>
    setPlaces(places.map((p, i) => (i === index ? { ...p, rating } : p)));

  /** 드래그로 옮기기 — from 을 뽑아 to 자리에 끼워 넣는다 (위/아래 버튼과 같은 결과) */
  const reorderPlaces = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= places.length || to >= places.length) return;
    const next = [...places];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setPlaces(next);
  };

  /** 등록 시점에 검색창에 남아 있는 장소도 담긴 것으로 본다 (담기 버튼을 안 눌러 글이 반려되지 않도록) */
  const collectPlaces = (): RecommendPlace[] => {
    const pending = (place?.name ?? location).trim();
    if (!pending) return places;
    if (places.some((p) => p.name === pending)) return places;
    return [...places, toPlace(place, pending)];
  };

  const getTips = () => {
    switch (type) {
      case 'recommend':
        return [
          "직접 촬영한 고화질 사진을 첨부하면 인기가 많아요.",
          "장소의 특징, 분위기, 방문 꿀팁을 자세히 공유해주세요.",
          "정확한 위치와 주차, 영업시간 정보를 함께 적어주세요."
        ];
      case 'qna':
        return [
          "질문 제목에 핵심 키워드를 넣으면 답변을 더 빨리 받을 수 있어요.",
          "현재 상황(누구와, 언제, 예산 등)을 상세히 적어주세요.",
          "도움이 된 답변에는 꼭 감사의 인사를 전해주세요!"
        ];
      default:
        return [
          "'/'를 입력하여 텍스트 스타일, 목록, 이미지 등을 추가할 수 있습니다.",
          "여행과 관련된 즐거운 이야기를 들려주세요.",
          "서로 존중하는 따뜻한 커뮤니티를 만들어가요."
        ];
    }
  };

  const handleSubmit = async () => {
    const submittedPlaces = collectPlaces();
    const rawBlocks = editor.document as any[];
    const contentText = blocksToText(rawBlocks);
    // 검증은 업로드 전에 한다 — 유효성 실패 시 이미지가 서버에 올라가 고아가 되는 것을 막는다.
    // 이미지 존재 여부만 보면 되므로 아직 data: URL이어도 무방하다.
    const hasImage = firstImageUrl(rawBlocks) != null;

    // 이미지 블록은 평문이 없으므로, 사진만 올린 글도 내용이 있는 것으로 본다
    if (!title.trim() || (contentText.trim().length === 0 && !hasImage)) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    if (type === 'recommend' && submittedPlaces.length === 0) {
      alert('장소를 한 곳 이상 추가해주세요.');
      return;
    }

    // 검증 통과 후에만 본문의 data: 이미지를 MinIO에 업로드해 URL로 교체한다
    let uploadedUrls: string[] = [];
    try {
      const resolved = await resolveContentImages(rawBlocks, uploadImage);
      uploadedUrls = resolved.uploadedUrls;
      const thumbnailUrl = firstImageUrl(resolved.blocks);

      const payload = {
        title: title.trim(),
        content: resolved.blocks,
        contentText,
        thumbnailUrl,
        ...(type === 'recommend' && {
          // 대표 장소(첫 번째)의 이름·주소·좌표는 서버가 places에서 뽑아 단일 장소 필드에 채운다
          places: submittedPlaces,
        }),
      };

      if (isEditMode) {
        await updatePostMutation.mutateAsync(payload);
      } else {
        await createPostMutation.mutateAsync({ category: type, ...payload });
      }
      onSubmit();
    } catch (error) {
      // 저장 실패 시 방금 올린 이미지는 고아가 되므로 정리한다
      uploadedUrls.forEach((url) => deleteImage(url).catch(() => {}));
      alert(`게시글 ${isEditMode ? '수정' : '등록'}에 실패했습니다: ${(error as Error).message}`);
    }
  };

  return {
    title,
    setTitle,
    location,
    place,
    setPlace,
    setLocation,
    places,
    addPlace,
    removePlace,
    movePlace,
    reorderPlaces,
    setPlaceMemo,
    setPlaceRating,
    rating,
    setRating,
    editor,
    handleSubmit,
    isSubmitting: createPostMutation.isPending || updatePostMutation.isPending,
    isEditMode,
    getTips
  };
};
