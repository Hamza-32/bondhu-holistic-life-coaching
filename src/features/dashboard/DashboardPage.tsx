import { useMemo } from 'react';
import { ArrowRight, BookOpen, CalendarClock, MessagesSquare, Wind } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/Avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { dhakaDateKey, formatDateTime, formatNumber } from '@/lib/format';
import { useMyBookings } from '@/features/coaching/api';
import { LevelCard, QuestList, StreakChip } from '@/features/gamification/components';
import { dailyAverages } from '@/features/mood/aggregate';
import { useMoodEntries } from '@/features/mood/api';
import { LazyMoodChart as MoodChart } from '@/features/mood/components/LazyMoodChart';
import { MoodCheckIn } from '@/features/mood/components/MoodCheckIn';
import { useProfile } from '@/features/profile/api';

function greetingKey(hour: number) {
  if (hour >= 5 && hour < 12) return 'pages.dashboard.greetingMorning' as const;
  if (hour >= 12 && hour < 17) return 'pages.dashboard.greetingAfternoon' as const;
  return 'pages.dashboard.greetingEvening' as const;
}

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  const profile = useProfile();
  const mood = useMoodEntries(7);
  const bookings = useMyBookings();
  const points = useMemo(() => dailyAverages(mood.data ?? [], 7), [mood.data]);

  const loggedToday = (mood.data ?? []).some(
    (m) => dhakaDateKey(m.created_at) === dhakaDateKey(new Date()),
  );
  const nextSession = (bookings.data ?? [])
    .filter((b) => b.status === 'upcoming' && b.slot && new Date(b.slot.starts_at) > new Date())
    .sort((a, b) => (a.slot?.starts_at ?? '').localeCompare(b.slot?.starts_at ?? ''))[0];

  if (!profile.data) return <Skeleton className="h-48" />;
  const p = profile.data;
  const lastActive = p.last_active_date;
  const today = dhakaDateKey(new Date());
  // No guilt: someone returning after a gap is welcomed back, never told they "lost" a streak.
  const returning = lastActive !== null && lastActive < today && p.current_streak <= 1;

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 rounded-3xl bg-linear-to-br from-brand to-brand-strong p-6 text-brand-foreground shadow-lifted sm:p-8 md:grid-cols-[1fr_16rem] md:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">
            {t(greetingKey(new Date().getHours()), { name: p.display_name })}
          </h1>
          <p className="mt-2 text-white/85">
            {returning
              ? t('gamification.welcomeBack')
              : t('pages.dashboard.streak', {
                  count: p.current_streak,
                  formatted: formatNumber(p.current_streak),
                })}
          </p>
          {p.longest_streak > 1 && (
            <p className="mt-1 text-sm text-white/70">
              {t('gamification.bestStreak', {
                count: p.longest_streak,
                formatted: formatNumber(p.longest_streak),
              })}
            </p>
          )}
        </div>
        <LevelCard profile={p} />
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card
            title={loggedToday ? t('dashboard.moodWeek') : t('mood.checkIn')}
            action={
              <Link
                to="/app/mood"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {t('dashboard.seeTrends')}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            }
          >
            {loggedToday ? <MoodChart points={points} days={7} /> : <MoodCheckIn compact />}
          </Card>

          <Card title={t('dashboard.quests')} action={<StreakChip streak={p.current_streak} />}>
            <QuestList />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={t('dashboard.nextSession')}>
            {bookings.isPending ? (
              <Skeleton className="h-16" />
            ) : nextSession?.mentor && nextSession.slot ? (
              <div className="flex items-center gap-3">
                <Avatar seed={nextSession.mentor.avatar_seed} size={44} />
                <div>
                  <p className="font-medium">{nextSession.mentor.name}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarClock className="size-3.5" aria-hidden />
                    {formatDateTime(nextSession.slot.starts_at)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>{t('dashboard.noSession')}</p>
                <Link
                  to="/app/coaching"
                  className="mt-2 inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  {t('dashboard.findMentor')}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            )}
          </Card>

          <Card title={t('dashboard.quickActions')}>
            <ul className="grid gap-2">
              {[
                { to: '/app/journal', icon: BookOpen, label: t('dashboard.actions.journal') },
                { to: '/app/arcade', icon: Wind, label: t('dashboard.actions.breathe') },
                {
                  to: '/app/community',
                  icon: MessagesSquare,
                  label: t('dashboard.actions.community'),
                },
              ].map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center gap-3 rounded-xl border p-3 font-medium transition-colors hover:bg-muted"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    {label}
                    <ArrowRight className="ml-auto size-4 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
