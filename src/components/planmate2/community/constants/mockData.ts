export const MOCK_POSTS = {
  free: Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    userId: 200 + i,
    title: `자유게시판 게시글 ${i + 1}`,
    author: `사용자${i + 1}`,
    level: Math.floor(Math.random() * 5) + 1,
    likes: Math.floor(Math.random() * 100),
    dislikes: Math.floor(Math.random() * 20),
    comments: Math.floor(Math.random() * 50),
    views: Math.floor(Math.random() * 1000),
    createdAt: `${Math.floor(Math.random() * 24) + 1}시간 전`,
    image: `https://images.unsplash.com/photo-${[
      '1506744038136-46273834b3fb',
      '1501785888041-af3ef285b470',
      '1472396961695-1ad22395ea92',
      '1532708059644-5590ed51ce4c',
      '1516483638261-f4dbaf036963',
      '1523906834658-6e24ef23a6f8'
    ][Math.floor(Math.random() * 6)]}?w=400&auto=format&fit=crop`,
    content: '여행에 대한 자유로운 이야기를 나누는 공간입니다. 서로의 경험을 공유해보세요!'
  })),
  qna: Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    userId: 300 + i,
    title: `질문있습니다 ${i + 1}`,
    author: `질문자${i + 1}`,
    level: Math.floor(Math.random() * 3) + 1,
    likes: Math.floor(Math.random() * 50),
    dislikes: Math.floor(Math.random() * 10),
    comments: Math.floor(Math.random() * 20),
    views: Math.floor(Math.random() * 500),
    createdAt: `${Math.floor(Math.random() * 24) + 1}시간 전`,
    isAnswered: Math.random() > 0.5,
    image: `https://images.unsplash.com/photo-${[
      '1519451241324-207a7ae3992c',
      '1512403754473-27835f7b9984',
      '1504150558240-0b4fd8946625',
      '1494232410401-ad00d5433cfa'
    ][Math.floor(Math.random() * 4)]}?w=400&auto=format&fit=crop`,
    content: '궁금한 점이 있어서 질문드립니다. 답변 부탁드려요!'
  })),
  mate: Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    userId: 400 + i,
    title: `동행 구합니다 ${i + 1}`,
    author: `동행자${i + 1}`,
    level: Math.floor(Math.random() * 5) + 1,
    likes: Math.floor(Math.random() * 30),
    dislikes: Math.floor(Math.random() * 5),
    comments: Math.floor(Math.random() * 10),
    views: Math.floor(Math.random() * 20),
    createdAt: `${Math.floor(Math.random() * 24) + 1}시간 전`,
    participants: Math.floor(Math.random() * 3) + 1,
    maxParticipants: 4,
    status: Math.random() > 0.3 ? 'recruiting' : 'closed' as 'recruiting' | 'closed',
    image: `https://images.unsplash.com/photo-${[
      '1527631746610-bca00a040d60',
      '1530789253388-582c481c54b0',
      '1523906834658-6e24ef23a6f8',
      '1501785888041-af3ef285b470'
    ][Math.floor(Math.random() * 4)]}?w=400&auto=format&fit=crop`,
    content: '함께 여행하실 분을 찾습니다. 일정 조율 가능합니다.'
  })),
  recommend: Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    userId: 500 + i,
    title: `[${['제주', '서울', '부산', '강릉'][Math.floor(Math.random() * 4)]}] ${['진짜 맛있는 횟집', '분위기 좋은 카페', '노을 명소', '숨겨진 야경포인트'][Math.floor(Math.random() * 4)]} 추천합니다!`,
    author: `추천왕${i + 1}`,
    level: Math.floor(Math.random() * 5) + 1,
    likes: Math.floor(Math.random() * 200),
    dislikes: Math.floor(Math.random() * 5),
    comments: Math.floor(Math.random() * 30),
    views: Math.floor(Math.random() * 2000),
    createdAt: `${Math.floor(Math.random() * 24) + 1}시간 전`,
    image: `https://images.unsplash.com/photo-${[
      '1506744038136-46273834b3fb',
      '1501785888041-af3ef285b470',
      '1472396961695-1ad22395ea92',
      '1532708059644-5590ed51ce4c'
    ][Math.floor(Math.random() * 4)]}?w=400&auto=format&fit=crop`,
    location: ['제주도', '서울특별시', '부산광역시', '강원도'][Math.floor(Math.random() * 4)],
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    content: '여기는 정말 제가 아껴둔 곳인데 공유합니다. 꼭 가보세요!',
    coords: [
      { lat: 33.450701, lng: 126.570667 }, // 제주
      { lat: 37.5665, lng: 126.9780 },   // 서울
      { lat: 35.1796, lng: 129.0756 },   // 부산
      { lat: 37.7512, lng: 128.8762 }    // 강릉
    ][i % 4]
  }))
};
