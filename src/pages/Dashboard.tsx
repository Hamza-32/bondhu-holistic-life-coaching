import { useTranslation } from 'react-i18next';
import { useBondhuStore } from '@/stores/useBondhuStore';
import { motion } from 'motion/react';
import { Trophy, Calendar, CheckSquare, Brain, Target, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

function greetingKey(hour: number) {
  if (hour >= 5 && hour < 12) return 'pages.dashboard.greetingMorning' as const;
  if (hour >= 12 && hour < 17) return 'pages.dashboard.greetingAfternoon' as const;
  return 'pages.dashboard.greetingEvening' as const;
}

export const Dashboard = () => {
  const { t } = useTranslation();
  const { user, sessions, quests, completeQuest } = useBondhuStore();

  const progressPercent = ((user.xp % 500) / 500) * 100;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-linear-to-br from-brand to-brand-strong p-6 text-brand-foreground shadow-lifted sm:p-8"
      >
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <h1 className="mb-2 text-3xl font-bold">
              {t(greetingKey(new Date().getHours()), { name: user.name })}
            </h1>
            <p className="text-white/85">{t('pages.dashboard.streak', { count: user.streak })}</p>
          </div>
          <div className="w-full rounded-xl bg-white/10 p-4 text-right backdrop-blur-sm md:w-auto md:min-w-[200px]">
            <div className="mb-1 text-xs tracking-wider text-white/85 uppercase">
              {t('pages.dashboard.currentLevel')}
            </div>
            <div className="flex items-center justify-end gap-2 text-4xl font-extrabold">
              {user.level}
              <Trophy className="h-8 w-8 fill-yellow-300 text-yellow-300" aria-hidden />
            </div>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/20"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={500}
              aria-valuenow={user.xp % 500}
              aria-label={t('pages.dashboard.currentLevel')}
            >
              <div className="h-full bg-white" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="mt-1 text-right text-xs text-white/85">{user.xp % 500} / 500 XP</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-6 md:col-span-2">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
                  <Brain size={20} />
                </div>
                <h3 className="font-semibold text-foreground">Mood Score</h3>
              </div>
              <div className="text-3xl font-bold text-foreground">{user.moodScore}/100</div>
              <p className="mt-1 flex items-center gap-1 text-sm text-green-500">
                <ArrowUpRight size={14} /> +5 this week
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-yellow-100 p-2 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400">
                  <Target size={20} />
                </div>
                <h3 className="font-semibold text-foreground">Coins</h3>
              </div>
              <div className="text-3xl font-bold text-foreground">{user.coins}</div>
              <p className="mt-1 text-sm text-muted-foreground">Spend on premiums</p>
            </div>
          </div>

          {/* Daily Quests */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
              <CheckSquare className="text-primary" /> Daily Quests
            </h2>
            <div className="space-y-3">
              {quests.map((quest) => (
                <div
                  key={quest.id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${quest.completed ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/40' : 'border-border bg-muted'}`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => completeQuest(quest.id)}
                      disabled={quest.completed}
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${quest.completed ? 'border-green-500 bg-green-500 text-white' : 'border-border hover:border-primary'}`}
                    >
                      {quest.completed && <CheckSquare size={14} />}
                    </button>
                    <span
                      className={
                        quest.completed
                          ? 'text-muted-foreground line-through'
                          : 'font-medium text-foreground'
                      }
                    >
                      {quest.title}
                    </span>
                  </div>
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                    +{quest.xpReward} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Upcoming Session */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Calendar className="text-primary" /> Upcoming
            </h2>
            {sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border-l-4 border-primary bg-muted p-4"
                  >
                    <p className="font-bold text-foreground">{session.coachName}</p>
                    <p className="mb-2 text-sm text-muted-foreground">{session.date}</p>
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      Video Call
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="mb-4 text-sm text-muted-foreground">No sessions booked.</p>
                <Link
                  to="/app/coaching"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Find a coach &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl bg-slate-900 p-6 text-white shadow-lg">
            <h3 className="mb-4 font-bold">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/app/toolkit"
                className="block w-full rounded-lg bg-white/10 py-2 text-center transition-colors hover:bg-white/20"
              >
                Log Mood
              </Link>
              <Link
                to="/app/arcade"
                className="block w-full rounded-lg bg-primary py-2 text-center font-semibold transition-colors hover:bg-primary/90"
              >
                Stress Relief
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
