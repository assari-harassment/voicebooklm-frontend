import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ja from './ja';

const resources = {
  ja: {
    translation: ja,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ja',          
    fallbackLng: 'ja',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });

export default i18n;