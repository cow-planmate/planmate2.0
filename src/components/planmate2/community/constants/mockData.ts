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
    image: `https://images.unsplash.com/photo-${
      [
        "1506744038136-46273834b3fb",
        "1501785888041-af3ef285b470",
        "1472396961695-1ad22395ea92",
        "1532708059644-5590ed51ce4c",
        "1516483638261-f4dbaf036963",
        "1523906834658-6e24ef23a6f8",
      ][Math.floor(Math.random() * 6)]
    }?w=400&auto=format&fit=crop`,
    content:
      "여행에 대한 자유로운 이야기를 나누는 공간입니다. 서로의 경험을 공유해보세요!",
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
    image: `https://images.unsplash.com/photo-${
      [
        "1519451241324-207a7ae3992c",
        "1512403754473-27835f7b9984",
        "1504150558240-0b4fd8946625",
        "1494232410401-ad00d5433cfa",
      ][Math.floor(Math.random() * 4)]
    }?w=400&auto=format&fit=crop`,
    content: "궁금한 점이 있어서 질문드립니다. 답변 부탁드려요!",
  })),
};
