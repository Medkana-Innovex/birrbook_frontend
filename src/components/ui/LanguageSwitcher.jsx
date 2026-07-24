import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({ className = '', dark = false }) {
  const { i18n } = useTranslation();
  const toggle = () => i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am');

  return (
    <button
      type="button"
      onClick={toggle}
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all shrink-0 ${
        dark
          ? 'border-white/30 text-white/80 hover:text-white hover:border-white/60'
          : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300'
      } ${className}`}
    >
      {i18n.language === 'am' ? 'EN' : 'አማ'}
    </button>
  );
}
