import { createI18n } from 'vue-i18n';

import en from '@/locales/en.json';

// Type-define 'en' as the master schema for the resource
type MessageSchema = typeof en;

export const SUPPORT_LOCALES = ['en'];

let i18n;

export function setupI18n(options = { locale: 'en' }) {
  i18n = createI18n<[MessageSchema], 'en'>({
    legacy: false, // Don't touch this
    locale: options.locale,
    fallbackLocale: 'en',
    messages: {
      en: en
    }
  });

  return i18n;
}
