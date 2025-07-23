export interface User {
  uid: string;
  twitterId: string;
  screenName: string;
  displayName: string;
  profileImageUrl: string;
  accessToken?: string;
  accessTokenSecret?: string;
  createdAt: Date;
}

export interface Challenge {
  id: string;
  userId: string;
  realName: string;
  startDate: Date;
  status: 'active' | 'completed' | 'failed';
  currentDay: number;
  createdAt: Date;
  completedAt?: Date;
  failedAt?: Date;
}

export interface SuccessLog {
  challengeId: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  reportedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number; // days required
  color: string;
}

export const BADGES: Badge[] = [
  {
    id: 'bronze',
    name: 'ブロンズメダル',
    description: '7日間連続成功！',
    icon: '🥉',
    requirement: 7,
    color: 'text-amber-600'
  },
  {
    id: 'silver',
    name: 'シルバーメダル',
    description: '14日間連続成功！',
    icon: '🥈',
    requirement: 14,
    color: 'text-gray-500'
  },
  {
    id: 'gold',
    name: 'ゴールドメダル',
    description: '21日間連続成功！',
    icon: '🥇',
    requirement: 21,
    color: 'text-yellow-500'
  },
  {
    id: 'champion',
    name: 'チャンピオン',
    description: '30日間完全制覇！',
    icon: '👑',
    requirement: 30,
    color: 'text-purple-600'
  }
];