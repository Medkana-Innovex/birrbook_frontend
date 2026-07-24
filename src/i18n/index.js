import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import am from './am.json';

const STORAGE_KEY = 'birrbook_lang';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      am: { translation: am },
    },
    lng: localStorage.getItem(STORAGE_KEY) || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

i18n.on('languageChanged', lng => localStorage.setItem(STORAGE_KEY, lng));

export default i18n;
