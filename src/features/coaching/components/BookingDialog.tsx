import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { dhakaDateKey, formatDate, formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { bookingErrorKey, useBookSlot, type Mentor } from '../api';

interface Props {
  mentor: Mentor | null;
  onClose: () => void;
}

/** Pick an open slot with a demo mentor and book it (via the double-booking-safe RPC). */
export function BookingDialog({ mentor, onClose }: Props) {
  const { t } = useTranslation();
  const book = useBookSlot();
  const [slotId, setSlotId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const notesId = useId();

  const days = useMemo(() => {
    const groups = new Map<string, Mentor['mentor_slots']>();
    for (const slot of mentor?.mentor_slots ?? []) {
      const key = dhakaDateKey(slot.starts_at);
      groups.set(key, [...(groups.get(key) ?? []), slot]);
    }
    return [...groups.entries()].slice(0, 10);
  }, [mentor]);

  const close = () => {
    setSlotId(null);
    setNotes('');
    onClose();
  };

  const confirm = () => {
    if (!slotId) return;
    book.mutate(
      { slotId, notes: notes.trim() || null },
      {
        onSuccess: () => {
          toast.success(t('coaching.booked', { name: mentor?.name ?? '' }));
          close();
        },
        onError: (error) => {
          toast.error(t(bookingErrorKey(error)));
          setSlotId(null);
        },
      },
    );
  };

  return (
    <Dialog open={mentor !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {mentor && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Avatar seed={mentor.avatar_seed} size={48} />
                <div className="text-left">
                  <DialogTitle>{t('coaching.bookWith', { name: mentor.name })}</DialogTitle>
                  <DialogDescription>{t('coaching.demoNote')}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {days.length === 0 ? (
              <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                {t('coaching.noSlots')}
              </p>
            ) : (
              <fieldset className="space-y-4">
                <legend className="text-sm font-medium">{t('coaching.pickSlot')}</legend>
                {days.map(([day, slots]) => (
                  <div key={day}>
                    <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
                      {formatDate(`${day}T06:00:00Z`, {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot) => (
                        <label
                          key={slot.id}
                          className={cn(
                            'cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
                            slotId === slot.id
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'hover:bg-muted',
                          )}
                        >
                          <input
                            type="radio"
                            name="slot"
                            className="sr-only"
                            checked={slotId === slot.id}
                            onChange={() => setSlotId(slot.id)}
                          />
                          {formatTime(slot.starts_at)}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </fieldset>
            )}

            <div className="space-y-2">
              <label htmlFor={notesId} className="text-sm font-medium">
                {t('coaching.notesLabel')}
              </label>
              <textarea
                id={notesId}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder={t('coaching.notesPlaceholder')}
                className="w-full resize-none rounded-lg border border-input bg-background p-3 text-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              />
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={close}>
                {t('common.cancel')}
              </Button>
              <Button onClick={confirm} disabled={!slotId || book.isPending}>
                {t('coaching.confirm')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
