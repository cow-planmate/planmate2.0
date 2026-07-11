export const MY_TRAVEL_POSTS = [
  {
    id: 1,
    title: '서울 3박 4일 완벽 여행 코스',
    destination: '서울',
    image: 'https://images.unsplash.com/photo-1638496708881-cf7fb0a27196?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    likes: 342,
    comments: 28,
    forks: 156,
    createdAt: '2일 전',
    tags: ['#뚜벅이최적화', '#동선낭비없는'],
    description: '경복궁, 북촌한옥마을, 명동까지 핫플 다 담았어요!',
    author: '여행러버',
    authorImage: 'https://images.unsplash.com/photo-1640960543409-dbe56ccc30e2?w=150&h=150&fit=crop',
    duration: '3박 4일',
  },
  {
    id: 2,
    title: '부산 바다 여행 완전정복',
    destination: '부산',
    image: 'https://images.unsplash.com/photo-1679054142611-5f0580dab94f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    likes: 421,
    comments: 52,
    forks: 278,
    createdAt: '1주 전',
    tags: ['#뚜벅이최적화', '#극한의J'],
    description: '해운대, 광안리, 송정해수욕장 완벽 동선',
    author: '여행러버',
    authorImage: 'https://images.unsplash.com/photo-1640960543409-dbe56ccc30e2?w=150&h=150&fit=crop',
    duration: '2박 3일',
  },
];

export const FORKED_TRAVEL_POSTS = [
  {
    id: 3,
    title: '제주도 힐링 여행 루트',
    destination: '제주도',
    image: 'https://images.unsplash.com/photo-1674606042265-c9f03a77e286?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    originalAuthor: '제주도마스터',
    forkedAt: '3일 전',
    likes: 289,
    comments: 34,
    forks: 203,
    tags: ['#여유로운P', '#극한의J'],
    description: '카페, 해변, 맛집 위주로 느긋하게 다녀왔어요',
    author: '제주도마스터',
    authorImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    duration: '4박 5일',
    createdAt: '5일 전',
  },
];

export const LIKED_TRAVEL_POSTS = [
  {
    id: 4,
    title: '강릉 카페 투어 여행',
    destination: '강릉',
    image: 'https://images.unsplash.com/photo-1768555520607-cb29f2bc6394?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    author: '카페러버',
    likedAt: '1일 전',
    likes: 156,
    comments: 12,
    forks: 45,
    tags: ['#카페투어', '#감성여행'],
    description: '강릉의 힙한 카페들을 모두 모았습니다.',
    authorImage: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    duration: '1박 2일',
    createdAt: '1일 전',
  },
];

export const MY_COMMUNITY_POSTS = [
  {
    id: 1,
    type: 'free',
    title: '여행 짐싸기 꿀팁 공유합니다',
    content: '다이소 압축팩 사용하면 옷 부피를 절반으로 줄일 수 있어요! 그리고 멀티탭은 필수입니다.',
    createdAt: '1일 전',
    likes: 45,
    comments: 18,
    views: 340,
  },
  {
    id: 101,
    type: 'qna',
    title: '교토 버스 패스 질문입니다',
    content: '하루에 3군데 정도 돌아다닐 예정인데 버스 패스 사는게 이득일까요? 아니면 그냥 이코카 카드 찍는게 나을까요?',
    createdAt: '1일 전',
    likes: 3,
    comments: 2,
    views: 45,
    isAnswered: true
  }
];

export const LIKED_COMMUNITY_POSTS = [
  {
    id: 2,
    type: 'free',
    title: '제주도 맛집 추천 좀 부탁드려요!',
    content: '이번에 가족들과 제주도 여행을 가는데 부모님 모시고 갈만한 정갈한 한식집 있을까요? 가격대는 인당 5만원 내외면 좋겠습니다.',
    createdAt: '2시간 전',
    likes: 12,
    comments: 5,
    views: 120,
    author: '제주조아'
  },
  {
    id: 201,
    type: 'mate',
    title: '7월 몽골 동행 구합니다',
    content: '7월 15일부터 4박 5일 일정으로 고비사막 투어 같이 하실 분 구해요. 현재 2명 있고 2명 더 모십니다. 성별 무관합니다.',
    createdAt: '3일 전',
    likes: 8,
    comments: 12,
    views: 300,
    participants: 2,
    maxParticipants: 4,
    author: '몽골러'
  }
];

export const FRIENDS_LIST = [
  {
    id: 1,
    nickName: '여행하는곰',
    profileLogo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    status: 'online',
    lastSeen: '현재 접속 중'
  },
  {
    id: 2,
    nickName: '서울토박이',
    profileLogo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    status: 'offline',
    lastSeen: '2시간 전'
  },
  {
    id: 3,
    nickName: '제주바람',
    profileLogo: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    status: 'online',
    lastSeen: '현재 접속 중'
  },
  {
    id: 4,
    nickName: '맛집사냥꾼',
    profileLogo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    status: 'offline',
    lastSeen: '1일 전'
  }
];

export const CHAT_ROOMS = [
  {
    id: 1,
    otherUser: {
      nickName: '여행하는곰',
      profileLogo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    },
    lastMessage: '네, 내일 명동에서 뵐게요!',
    time: '오후 3:45',
    unreadCount: 2
  },
  {
    id: 2,
    otherUser: {
      nickName: '서울토박이',
      profileLogo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    lastMessage: '서울 맛집 리스트 공유해주셔서 감사합니다.',
    time: '어제',
    unreadCount: 0
  }
];
