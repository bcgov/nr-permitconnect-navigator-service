import { createI18n } from 'vue-i18n';

import enCA from '@/locales/en-CA.json';

const messages = {
  'en-CA': enCA
};

export const SUPPORT_LOCALES = ['en-CA'];

// Create VueI18n instance with options
const instance = createI18n({
  legacy: false, // Set to false to use Composition API
  locale: 'en-CA',
  fallbackLocale: 'en-CA',
  messages, // Set locale messages
  globalInjection: true
});

export default instance;

export const i18n = instance.global;
