import { currentLanguage, type Language } from './i18n';

/** BCP-47 locale for Intl formatting. Bangla uses Bengali digits and month names. */
export function intlLocale(lang: Language = currentLanguage()): string {
  return lang === 'bn' ? 'bn-BD' : 'en-GB';
}

/** Bangladesh time, used for anything that defines "a day" (matches the database). */
export const APP_TIME_ZONE = 'Asia/Dhaka';

export function formatNumber(value: number, lang?: Language): string {
  return new Intl.NumberFormat(intlLocale(lang)).format(value);
}

export function formatDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
  lang?: Language,
): string {
  return new Intl.DateTimeFormat(intlLocale(lang), { timeZone: APP_TIME_ZONE, ...options }).format(
    new Date(value),
  );
}

export function formatTime(value: string | Date, lang?: Language): string {
  return new Intl.DateTimeFormat(intlLocale(lang), {
    timeZone: APP_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date, lang?: Language): string {
  return new Intl.DateTimeFormat(intlLocale(lang), {
    timeZone: APP_TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/** "5 minutes ago" / "৫ মিনিট আগে". */
export function formatRelative(
  value: string | Date,
  now: Date = new Date(),
  lang?: Language,
): string {
  const seconds = Math.round((new Date(value).getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(intlLocale(lang), { numeric: 'auto' });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(0, 'minute');
}

/** YYYY-MM-DD of a timestamp in Bangladesh time. */
export function dhakaDateKey(value: string | Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}
