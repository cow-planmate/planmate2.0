export const MY_COMMUNITY_POSTS = [
  {
    id: 1,
    type: "free",
    title: "여행 짐싸기 꿀팁 공유합니다",
    content:
      "다이소 압축팩 사용하면 옷 부피를 절반으로 줄일 수 있어요! 그리고 멀티탭은 필수입니다.",
    createdAt: "1일 전",
    likes: 45,
    comments: 18,
    views: 340,
  },
  {
    id: 101,
    type: "qna",
    title: "교토 버스 패스 질문입니다",
    content:
      "하루에 3군데 정도 돌아다닐 예정인데 버스 패스 사는게 이득일까요? 아니면 그냥 이코카 카드 찍는게 나을까요?",
    createdAt: "1일 전",
    likes: 3,
    comments: 2,
    views: 45,
    isAnswered: true,
  },
];

export const LIKED_COMMUNITY_POSTS = [
  {
    id: 2,
    type: "free",
    title: "제주도 맛집 추천 좀 부탁드려요!",
    content:
      "이번에 가족들과 제주도 여행을 가는데 부모님 모시고 갈만한 정갈한 한식집 있을까요? 가격대는 인당 5만원 내외면 좋겠습니다.",
    createdAt: "2시간 전",
    likes: 12,
    comments: 5,
    views: 120,
    author: "제주조아",
  },
];

export const FRIENDS_LIST = [
  {
    id: 1,
    nickName: "여행하는곰",
    profileLogo:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
    status: "online",
    lastSeen: "현재 접속 중",
  },
  {
    id: 2,
    nickName: "서울토박이",
    profileLogo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    status: "offline",
    lastSeen: "2시간 전",
  },
  {
    id: 3,
    nickName: "제주바람",
    profileLogo:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop",
    status: "online",
    lastSeen: "현재 접속 중",
  },
  {
    id: 4,
    nickName: "맛집사냥꾼",
    profileLogo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    status: "offline",
    lastSeen: "1일 전",
  },
];

export const CHAT_ROOMS = [
  {
    id: 1,
    otherUser: {
      nickName: "여행하는곰",
      profileLogo:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
    },
    lastMessage: "네, 내일 명동에서 뵐게요!",
    time: "오후 3:45",
    unreadCount: 2,
  },
  {
    id: 2,
    otherUser: {
      nickName: "서울토박이",
      profileLogo:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    lastMessage: "서울 맛집 리스트 공유해주셔서 감사합니다.",
    time: "어제",
    unreadCount: 0,
  },
];
