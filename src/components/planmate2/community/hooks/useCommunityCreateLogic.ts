import { ko } from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import { useMemo, useState } from 'react';
import { uploadImage } from '../api/communityApi';
import { blocksToText } from '../utils/blocksToText';
import { useCreatePost } from './queries';

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
  onSubmit: () => void
) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState('5.0');
  const [mateCount, setMateCount] = useState('2');

  const createPostMutation = useCreatePost();

  const initialContent = useMemo(() => [
    {
      type: "paragraph",
      content: [],
    },
  ], []);

  const editor = useCreateBlockNote({
    dictionary: ko,
    initialContent,
    // '/' 명령 이미지 업로드 → 커뮤니티 이미지 API (MinIO)
    uploadFile: uploadImage,
  });

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
    const blocks = editor.document;
    const contentText = blocksToText(blocks as any[]);

    if (!title.trim() || contentText.trim().length === 0) {
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

    try {
      await createPostMutation.mutateAsync({
        category: type,
        title: title.trim(),
        content: blocks,
        contentText,
        thumbnailUrl: firstImageUrl(blocks as any[]),
        ...(type === 'recommend' && { location: location.trim(), rating: Number(rating) }),
        ...(type === 'mate' && {
          region: location.trim(),
          maxParticipants: mateCount === 'unlimited' ? null : Number(mateCount),
        }),
      });
      onSubmit();
    } catch (error) {
      alert(`게시글 등록에 실패했습니다: ${(error as Error).message}`);
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
    isSubmitting: createPostMutation.isPending,
    getTips
  };
};
