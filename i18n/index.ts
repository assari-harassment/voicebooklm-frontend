import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commons from './commons';
import features from './features';

// 日本語のみ運用。ドメインごとに分割した辞書を集約。
const resources = {
  ja: {
    translation: {
      ...commons,
      ...features,
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'ja',
  fallbackLng: 'ja',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;