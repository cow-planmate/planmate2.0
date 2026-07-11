import { ko } from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import { useMemo, useState } from 'react';

export const useCommunityCreateLogic = (
  type: 'free' | 'qna' | 'mate' | 'recommend',
  onSubmit: () => void
) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState('5.0');
  const [mateCount, setMateCount] = useState('2');
  
  const initialContent = useMemo(() => [
    {
      type: "paragraph",
      content: [],
    },
  ], []);

  const editor = useCreateBlockNote({
    dictionary: ko,
    initialContent,
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
    if (!title.trim() || editor.document.length === 0) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    const blocks = editor.document;
    
    console.log('Post submitted:', { 
      type, 
      title, 
      blocks, 
      ...(type === 'recommend' && { location, rating }),
      ...(type === 'mate' && { location, mateCount })
    });
    onSubmit();
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
    getTips
  };
};
