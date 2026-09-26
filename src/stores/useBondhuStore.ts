import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type UserProfile,
  type Coach,
  type Session,
  type Post,
  type Quest,
  type JournalEntry,
  type PostComment,
} from '@/types';

interface BondhuState {
  user: UserProfile;
  coaches: Coach[];
  sessions: Session[];
  posts: Post[];
  quests: Quest[];
  journalEntries: JournalEntry[];
  notification: { message: string; visible: boolean } | null;

  // Actions
  /** Mirror the Supabase profile name into the legacy store (no XP side effects). */
  syncName: (name: string) => void;
  checkStreak: () => void;
  addXp: (amount: number, reason: string) => void;
  bookSession: (coach: Coach, date: string, phoneNumber?: string, topic?: string) => void;
  addPost: (content: string) => void;
  addComment: (postId: string, content: string) => void;
  toggleLike: (postId: string) => void;
  completeQuest: (questId: string) => void;
  logMood: (mood: 'happy' | 'neutral' | 'stressed') => void;
  addJournalEntry: (content: string, mood: string) => void;
  hideNotification: () => void;
  logout: () => void;
}

const INITIAL_USER: UserProfile = {
  name: '', // Empty to trigger onboarding
  level: 1,
  xp: 0,
  streak: 0,
  coins: 50,
  moodScore: 50,
  badges: [],
  lastLoginDate: '',
};

const INITIAL_QUESTS: readonly Quest[] = [
  { id: 'q1', title: 'Morning Check-in', xpReward: 50, completed: false },
  { id: 'q2', title: "Practice '4-7-8' Breathing", xpReward: 100, completed: false },
  { id: 'q3', title: 'Read 1 Self-Care Article', xpReward: 30, completed: false },
];

export const useBondhuStore = create<BondhuState>()(
  persist(
    (set, get) => ({
      user: { ...INITIAL_USER },
      coaches: [
        {
          id: '1',
          name: 'Sarah Ahmed',
          specialty: 'Career & BCS Prep',
          price: 500,
          rating: 4.9,
          image: 'https://picsum.photos/200/200',
          available: true,
        },
        {
          id: '2',
          name: 'Tanvir Hasan',
          specialty: 'Academic Stress',
          price: 300,
          rating: 4.7,
          image: 'https://picsum.photos/201/201',
          available: true,
        },
        {
          id: '3',
          name: 'Nusrat Jahan',
          specialty: 'Mental Wellness',
          price: 600,
          rating: 5.0,
          image: 'https://picsum.photos/202/202',
          available: true,
        },
      ],
      sessions: [],
      posts: [
        {
          id: '1',
          author: 'Sumaiya K.',
          content:
            'The traffic in Dhaka is draining my energy before I even reach university. How do you guys stay productive during commute?',
          likes: 12,
          comments: [],
          timestamp: '2h ago',
          isUser: false,
          hasLiked: false,
        },
        {
          id: '2',
          author: 'Arif M.',
          content:
            'Finally finished my CV using the template here. Applying for internships next week. Wish me luck bondhu!',
          likes: 45,
          comments: [],
          timestamp: '5h ago',
          isUser: false,
          hasLiked: false,
        },
        {
          id: '3',
          author: 'Rafiq S.',
          content:
            'Feeling overwhelmed with family pressure for marriage vs career. Need to book a session soon.',
          likes: 8,
          comments: [],
          timestamp: '1d ago',
          isUser: false,
          hasLiked: false,
        },
      ],
      journalEntries: [],
      quests: INITIAL_QUESTS.map((q) => ({ ...q })),
      notification: null,

      syncName: (name) => {
        if (get().user.name === name) return;
        set((state) => ({ user: { ...state.user, name } }));
      },

      checkStreak: () => {
        set((state) => {
          const today = new Date().toISOString().slice(0, 10);
          const lastLogin = state.user.lastLoginDate;

          if (lastLogin === today) {
            return { user: state.user }; // Already logged in today
          }

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().slice(0, 10);

          let newStreak = state.user.streak;

          if (lastLogin === yesterdayString) {
            newStreak += 1; // Consecutive day
          } else if (lastLogin !== today) {
            newStreak = 1; // Broken streak or first login
          }

          // If streak increased, notify
          if (newStreak > state.user.streak) {
            setTimeout(() => get().addXp(50, 'Daily Streak Bonus!'), 500);
          }

          return {
            user: { ...state.user, streak: newStreak, lastLoginDate: today },
          };
        });
      },

      addXp: (amount, reason) => {
        set((state) => {
          const newXp = state.user.xp + amount;
          const newLevel = Math.floor(newXp / 500) + 1;

          return {
            user: { ...state.user, xp: newXp, level: newLevel },
            notification: { message: `🌟 +${amount} XP: ${reason}`, visible: true },
          };
        });

        setTimeout(() => {
          set({ notification: null });
        }, 3000);
      },

      bookSession: (coach, date, phoneNumber, topic) => {
        const newSession: Session = {
          id: Math.random().toString(),
          coachId: coach.id,
          coachName: coach.name,
          date: date,
          phoneNumber,
          topic,
          status: 'upcoming',
        };
        set((state) => ({
          sessions: [...state.sessions, newSession],
          user: { ...state.user, coins: Math.max(0, state.user.coins - 50) }, // Mock cost
        }));
        get().addXp(150, 'Session Booked');
      },

      addPost: (content) => {
        const newPost: Post = {
          id: Math.random().toString(),
          author: get().user.name,
          content,
          likes: 0,
          comments: [],
          timestamp: 'Just now',
          isUser: true,
          hasLiked: false,
        };
        set((state) => ({ posts: [newPost, ...state.posts] }));
        get().addXp(20, 'Community Contribution');
      },

      addComment: (postId, content) => {
        const newComment: PostComment = {
          id: Math.random().toString(),
          postId,
          author: get().user.name,
          content,
          timestamp: 'Just now',
        };
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p,
          ),
        }));
        get().addXp(5, 'Comment Added');
      },

      toggleLike: (postId) => {
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id === postId) {
              // Toggle logic
              const newHasLiked = !p.hasLiked;
              const newLikes = newHasLiked ? p.likes + 1 : p.likes - 1;
              return { ...p, likes: Math.max(0, newLikes), hasLiked: newHasLiked };
            }
            return p;
          }),
        }));
      },

      completeQuest: (questId) => {
        const quest = get().quests.find((q) => q.id === questId);
        if (quest && !quest.completed) {
          set((state) => ({
            quests: state.quests.map((q) => (q.id === questId ? { ...q, completed: true } : q)),
          }));
          get().addXp(quest.xpReward, 'Quest Completed');
        }
      },

      logMood: (mood) => {
        let scoreChange = 0;
        if (mood === 'happy') scoreChange = 5;
        if (mood === 'stressed') scoreChange = -5;

        set((state) => ({
          user: {
            ...state.user,
            moodScore: Math.min(100, Math.max(0, state.user.moodScore + scoreChange)),
          },
        }));
        get().addXp(10, 'Mood Logged');
      },

      addJournalEntry: (content, mood) => {
        const newEntry: JournalEntry = {
          id: Math.random().toString(),
          date: new Date().toISOString(),
          content,
          mood,
        };
        set((state) => ({
          journalEntries: [newEntry, ...state.journalEntries],
        }));
        get().addXp(30, 'Journal Entry');
      },

      hideNotification: () => set({ notification: null }),

      // Clears all private data (journal, sessions, quest progress) so the next person to use this
      // device does not see it. Community posts are shared data and are kept.
      logout: () => {
        set({
          user: { ...INITIAL_USER },
          sessions: [],
          journalEntries: [],
          quests: INITIAL_QUESTS.map((q) => ({ ...q })),
          notification: null,
        });
      },
    }),
    {
      name: 'bondhu-storage',
    },
  ),
);

/** Clear all private legacy data on this device (used on sign-out and account switch). */
export function resetLegacyUserData() {
  useBondhuStore.getState().logout();
}
