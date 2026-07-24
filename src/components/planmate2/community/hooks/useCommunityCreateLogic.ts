import { ko } from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useMemo, useState } from 'react';
import { deleteImage, uploadImage } from '../api/communityApi';
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
  type: 'free' | 'qna' | 'mate' | 'recommend',
  onSubmit: () => void,
  /** 지정하면 수정 모드로 동작한다 (기존 글을 불러와 프리필 후 PATCH) */
  editPostId?: number | string
) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState('5.0');
  const [mateCount, setMateCount] = useState('2');

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
    if (existingPost.location) setLocation(existingPost.location);
    if (existingPost.region) setLocation(existingPost.region);
    if (existingPost.rating) setRating(String(existingPost.rating));
    if (existingPost.maxParticipants) setMateCount(String(existingPost.maxParticipants));

    const blocks = existingPost.content as any[];
    if (Array.isArray(blocks) && blocks.length > 0) {
      editor.replaceBlocks(editor.document, blocks);
    }
    setIsPrefilled(true);
  }, [isEditMode, existingPost, isPrefilled, editor]);

  const getTips = () => {
    switch (type) {
      case 'mate':
        return [
          "성별, 연령대 등 희망하는 메이트 성향을 적어주세요.",
          "여행 일정과 방문하고 싶은 장소를 공유하면 매칭이 빨라요.",
          "참여 방법(댓글, 오픈채팅 등)을 명확하게 알려주세요."
        ];
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
    if (type === 'recommend' && !location.trim()) {
      alert('위치를 입력해주세요.');
      return;
    }
    if (type === 'mate' && !location.trim()) {
      alert('여행 희망 지역을 입력해주세요.');
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
        ...(type === 'recommend' && { location: location.trim(), rating: Number(rating) }),
        ...(type === 'mate' && {
          region: location.trim(),
          maxParticipants: mateCount === 'unlimited' ? null : Number(mateCount),
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
    setLocation,
    rating,
    setRating,
    mateCount,
    setMateCount,
    editor,
    handleSubmit,
    isSubmitting: createPostMutation.isPending || updatePostMutation.isPending,
    isEditMode,
    getTips
  };
};
