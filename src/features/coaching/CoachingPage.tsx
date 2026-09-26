import { useState } from 'react';
import { CalendarClock, Languages, MapPin, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Avatar } from '@/components/Avatar';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateTime, formatNumber } from '@/lib/format';
import { currentLanguage } from '@/lib/i18n';
import { useDivisions } from '@/features/reference/api';
import { useCancelBooking, useMentors, useMyBookings, type Mentor } from './api';
import { BookingDialog } from './components/BookingDialog';
import { PractitionerDirectory } from './components/PractitionerDirectory';

function MentorCard({ mentor, onBook }: { mentor: Mentor; onBook: () => void }) {
  const { t } = useTranslation();
  const divisions = useDivisions();
  const bn = currentLanguage() === 'bn';
  const division = divisions.data?.find((d) => d.slug === mentor.division);

  return (
    <li className="flex flex-col rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <Avatar seed={mentor.avatar_seed} size={56} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{mentor.name}</h3>
          <p className="mt-0.5 inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {t('coaching.fictionalBadge')}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1 text-sm font-semibold"
          aria-label={t('coaching.rating', { rating: formatNumber(mentor.rating) })}
        >
          <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
          {formatNumber(mentor.rating)}
        </span>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{bn ? mentor.bio_bn : mentor.bio_en}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {mentor.expertise.map((e) => (
          <li
            key={e}
            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            {t(`coaching.expertise.${e}` as 'coaching.expertise.bcs', { defaultValue: e })}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {division && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {bn ? division.name_bn : division.name_en}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Languages className="size-3.5" aria-hidden />
          {mentor.languages.map((l) => t(`language.${l}` as 'language.en')).join(', ')}
        </span>
      </div>
      <Button className="mt-5" onClick={onBook} disabled={mentor.mentor_slots.length === 0}>
        <CalendarClock aria-hidden />
        {mentor.mentor_slots.length === 0 ? t('coaching.noSlotsShort') : t('coaching.book')}
      </Button>
    </li>
  );
}

function MyBookings() {
  const { t } = useTranslation();
  const bookings = useMyBookings();
  const cancel = useCancelBooking();
  const upcoming = (bookings.data ?? []).filter(
    (b) => b.status === 'upcoming' && b.slot && new Date(b.slot.starts_at) > new Date(),
  );

  if (bookings.isPending || upcoming.length === 0) return null;

  return (
    <section
      aria-labelledby="my-sessions"
      className="mb-8 rounded-2xl border bg-card p-5 shadow-soft"
    >
      <h2 id="my-sessions" className="font-semibold">
        {t('coaching.mySessions')}
      </h2>
      <ul className="mt-3 divide-y">
        {upcoming.map((b) => (
          <li key={b.id} className="flex flex-wrap items-center gap-3 py-3">
            {b.mentor && <Avatar seed={b.mentor.avatar_seed} size={36} />}
            <div className="min-w-0 flex-1">
              <p className="font-medium">{b.mentor?.name}</p>
              <p className="text-sm text-muted-foreground">
                {b.slot && formatDateTime(b.slot.starts_at)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={cancel.isPending}
              onClick={() =>
                cancel.mutate(b.id, {
                  onSuccess: () => toast.success(t('coaching.cancelled')),
                  onError: () => toast.error(t('common.saveFailed')),
                })
              }
            >
              {t('coaching.cancel')}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CoachingPage() {
  const { t } = useTranslation();
  const mentors = useMentors();
  const [selected, setSelected] = useState<Mentor | null>(null);

  return (
    <div>
      <PageHeader title={t('pages.coaching.title')} subtitle={t('pages.coaching.subtitle')} />

      <Tabs defaultValue="mentors">
        <TabsList className="mb-6">
          <TabsTrigger value="mentors">{t('coaching.tabs.mentors')}</TabsTrigger>
          <TabsTrigger value="directory">{t('coaching.tabs.directory')}</TabsTrigger>
        </TabsList>

        <TabsContent value="mentors">
          <MyBookings />
          <p className="mb-4 text-sm text-muted-foreground">{t('coaching.mentorsIntro')}</p>
          {mentors.isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
              <Skeleton className="hidden h-72 lg:block" />
            </div>
          ) : mentors.isError ? (
            <p className="text-destructive">{t('common.loadFailed')}</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mentors.data.map((m) => (
                <MentorCard key={m.id} mentor={m} onBook={() => setSelected(m)} />
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="directory">
          <PractitionerDirectory />
        </TabsContent>
      </Tabs>

      <BookingDialog mentor={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default CoachingPage;
