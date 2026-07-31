export interface TravelPost {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  /** 작성자가 올린 프로필 사진 (커뮤니티 API 응답) */
  authorImage?: string | null;
  /** 작성자 이메일 해시 — Gravatar 폴백용 (커뮤니티 API 응답) */
  authorAvatarHash?: string | null;
  location: string;
  duration: string;
  coverImage: string;
  forkCount: number;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  viewCount: number;
  tags: string[];
  createdAt: string;
  verified: boolean;
  description: string;
  schedule: {
    id: string;
    time: string;
    location: string;
    description: string;
    note?: string;
  }[];
}

export type CommunityPost = {
  id: string;
  category: 'free' | 'qna' | 'mate' | 'recommend';
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  comments: number;
  isPinned?: boolean;
  isHot?: boolean;
  tags?: string[];
};

export type ChatRoom = {
  id: string;
  name: string;
  region: string;
  members: number;
  lastMessage: string;
  lastMessageTime: string;
};
