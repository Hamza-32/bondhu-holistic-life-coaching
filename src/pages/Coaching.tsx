import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBondhuStore } from '@/stores/useBondhuStore';
import { Star, Clock } from 'lucide-react';
import { type Coach } from '@/types';

export const Coaching = () => {
  const { t } = useTranslation();
  const { coaches, bookSession } = useBondhuStore();
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  // Escape closes the booking dialog.
  useEffect(() => {
    if (!selectedCoach) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCoach(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedCoach]);

  const handleBookWithDetails = (phone: string, topic: string) => {
    if (selectedCoach) {
      bookSession(selectedCoach, 'Tomorrow, 4:00 PM', phone, topic);
      setSelectedCoach(null);
    }
  };

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-foreground">{t('pages.coaching.title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('pages.coaching.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {coaches.map((coach) => (
          <div
            key={coach.id}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative h-24 bg-linear-to-r from-slate-800 to-slate-700">
              <div className="absolute -bottom-10 left-6">
                <img
                  src={coach.image}
                  alt={coach.name}
                  className="h-20 w-20 rounded-full border-4 border-card object-cover"
                />
              </div>
            </div>
            <div className="p-6 pt-12">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{coach.name}</h3>
                  <p className="text-sm font-medium text-primary">{coach.specialty}</p>
                </div>
                <div className="flex items-center gap-1 rounded bg-yellow-50 px-2 py-1 text-sm font-bold text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300">
                  <Star size={14} className="fill-yellow-500 text-yellow-500" aria-hidden />
                  {coach.rating}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <span className="block text-xs text-muted-foreground">Rate per session</span>
                  <span className="text-lg font-bold text-foreground">${coach.price}</span>
                </div>
                <button
                  onClick={() => setSelectedCoach(coach)}
                  className="rounded-lg bg-foreground px-4 py-2 font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Form Modal */}
      {selectedCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            className="w-full max-w-md animate-in rounded-2xl bg-card p-6 shadow-2xl duration-200 fade-in zoom-in"
          >
            <h3 id="booking-title" className="mb-4 text-xl font-bold">
              Book a session with {selectedCoach.name}
            </h3>

            <div className="mb-6 space-y-4">
              {/* Time Selection */}
              <div>
                <p className="mb-2 block text-sm font-medium text-foreground">Select Time</p>
                <div className="space-y-2">
                  <div className="flex cursor-pointer items-center gap-3 rounded-lg border border-primary bg-primary/10 p-3 hover:bg-muted">
                    <Clock className="text-primary" aria-hidden />
                    <div>
                      <div className="font-semibold text-foreground">Tomorrow</div>
                      <div className="text-sm text-muted-foreground">4:00 PM - 5:00 PM</div>
                    </div>
                  </div>
                  <div className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 opacity-60 hover:bg-muted">
                    <Clock className="text-muted-foreground" aria-hidden />
                    <div>
                      <div className="font-semibold text-foreground">Wednesday</div>
                      <div className="text-sm text-muted-foreground">10:00 AM - 11:00 AM</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details Form */}
              <div>
                <label
                  htmlFor="phone-input"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className="w-full rounded-lg border border-input bg-background p-3 focus:ring-2 focus:ring-ring/30 focus:outline-none"
                  id="phone-input"
                />
              </div>

              <div>
                <label
                  htmlFor="topic-input"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Topic / Concern <span className="text-destructive">*</span>
                </label>
                <textarea
                  placeholder="Briefly describe what you want to discuss..."
                  className="h-24 w-full resize-none rounded-lg border border-input bg-background p-3 focus:ring-2 focus:ring-ring/30 focus:outline-none"
                  id="topic-input"
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-border pt-2">
              <button
                onClick={() => setSelectedCoach(null)}
                className="flex-1 rounded-xl py-3 font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const phone = (document.getElementById('phone-input') as HTMLInputElement).value;
                  const topic = (document.getElementById('topic-input') as HTMLTextAreaElement)
                    .value;

                  if (phone && topic) {
                    handleBookWithDetails(phone, topic);
                  } else {
                    alert('Please fill in all fields.');
                  }
                }}
                className="flex-1 rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
