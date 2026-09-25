export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  streak: number;
  coins: number;
  moodScore: number; // 0-100
  badges: string[];
  lastLoginDate: string; // ISO Date string YYYY-MM-DD
}

export interface Coach {
  id: string;
  name: string;
  specialty: string;
  price: number;
  rating: number;
  image: string;
  available: boolean;
}

export interface Session {
  id: string;
  coachId: string;
  coachName: string;
  date: string;
  phoneNumber?: string;
  topic?: string;
  status: 'upcoming' | 'completed';
}

export interface PostComment {
  id: string;
  postId: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  author: string;
  content: string;
  likes: number;
  comments: PostComment[];
  timestamp: string;
  isUser: boolean;
  hasLiked: boolean; // Track if current user liked it
}

export interface Quest {
  id: string;
  title: string;
  xpReward: number;
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: string;
}
