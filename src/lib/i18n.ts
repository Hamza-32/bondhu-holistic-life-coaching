import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import bn from '@/locales/bn.json';
import en from '@/locales/en.json';

export const SUPPORTED_LANGUAGES = ['en', 'bn'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = 'bondhu-lang';

export const resources = {
  en: { translation: en },
  bn: { translation: bn },
} as const;

function syncDocumentLanguage(lng: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
}

i18n.on('languageChanged', syncDocumentLanguage);

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    returnObjects: false,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

export function currentLanguage(): Language {
  return i18n.resolvedLanguage === 'bn' ? 'bn' : 'en';
}

export default i18n;
